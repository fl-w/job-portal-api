import jwt from 'jsonwebtoken';
import {
  vi,
  describe,
  expect,
  beforeAll,
  test,
} from 'vitest';
import database from './database';
import app from '../src/main';
import supertest from 'supertest';
import { generateToken } from '../src/services';
import { JobApplicationModel, User } from '../src/models';
import mongoose from 'mongoose';

beforeAll(async () => {
  await database.connect();

  vi.mock('../src/config', () => ({
    config: {
      saltRounds: 1, // we reduce salt rounds for faster tests
      jwtSecret: 'mocked_secret',
    },
  }));

  return async () => {
    await database.disconnect();
  };
});

const creds = {
  email: 'john.doe@example.com',
  password: 'securepassword',
};

describe('User Endpoints', () => {
  let token: string;

  test('POST /api/auth/signup should create user', async () => {
    /**
     * As a user I should be able to create an account with email, first name, last name and a secure password.
     */
    const res = await supertest(app).post('/api/auth/signup').send({
      firstName: 'John',
      lastName: 'Doe',
      email: creds.email,
      password: creds.password,
    });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/auth/login should log in user', async () => {
    /**
     * As a user I should be able to login with the account I created.
     */
    const response = await supertest(app).post('/api/auth/login').send({
      email: creds.email,
      password: creds.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    token = response.body.token as string;
  });

  test('GET /api/user/profile should get user profile', async () => {
    /**
     * As a user I should be able to view my profile details.
     */
    const response = await supertest(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', creds.email);
    expect(response.body).toHaveProperty('firstName', 'John');
    expect(response.body).toHaveProperty('lastName', 'Doe');
    expect(response.body).toHaveProperty('appliedJobs', []);
    expect(response.body).not.toHaveProperty('password');
  });

  test('GET /api/user/applied-jobs should get user applied jobs', async () => {
    /**
     * As a user I should be able to view all the jobs I applied for.
     */
    const response = await supertest(app)
      .get('/api/user/applied-jobs')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

describe('Job endpoints', () => {
  const userDetails = {
    firstName: 'John',
    lastName: 'Doe',
    email: creds.email,
    password: creds.password,
  };
  // test ids still needs to be a valid ObjectId
  const userToken = generateToken({
    _id: new mongoose.Types.ObjectId(),
    role: 'user',
    ...userDetails,
  } as User);
  const adminToken = generateToken({
    _id: new mongoose.Types.ObjectId(),
    role: 'admin',
    ...userDetails,
  } as User);

  let createdJobId: string;
  test('POST /api/jobs should create a job (admin only)', async () => {
    /**
     * As an admin user I should be able to add a job with title, description, image, active, posted at, company, salary to the platform.
     */
    const jobData = {
      title: 'Software Engineer',
      description: 'Exciting job opportunity!',
      image: 'https://example.com/image.jpg',
      location: 'Singapore, Singapore',
      company: 'Tech Co.',
      salary: {
        currency: 'sgd',
        min: 6000,
        max: 6500,
      },
    };

    const res = await supertest(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(jobData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('active');
    expect(res.body).toHaveProperty('title', jobData.title);
    expect(res.body).toHaveProperty('description', jobData.description);
    expect(res.body.salary).toBeInstanceOf(Object);
    expect(res.body.salary).toHaveProperty('currency', 'SGD');

    createdJobId = res.body.id as string;
  });

  test('GET /api/jobs/:jobId should get details of a specific job', async () => {
    /**
     * As a user I should be able to view more details of a selected job.
     */
    const res = await supertest(app).get(`/api/jobs/${createdJobId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Software Engineer');
    expect(res.body).toHaveProperty('description', 'Exciting job opportunity!');

    const objectId = new mongoose.Types.ObjectId();
    const jobNotExistsResponse = await supertest(app).get(
      `/api/jobs/${objectId}`
    );
    expect(jobNotExistsResponse.statusCode).toBe(404);
  });

  test('GET /api/jobs should list all jobs', async () => {
    /**
     * As a user I should be able to list all the jobs on the platform.
     */
    const res = await supertest(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('jobs');
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0]).toHaveProperty('id', createdJobId);
  });

  let jobApplicationId: string;
  test('POST /api/jobs/:jobId/apply should allow user to apply for a job', async () => {
    /**
     * As a user, I should be able to apply for a specific job.
     */
    const applicationData = {
      firstName: 'John',
      lastName: 'Doe',
      coverLetter: 'I am excited to apply for this position.',
    };

    const res = await supertest(app)
      .post(`/api/jobs/${createdJobId}/apply`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(applicationData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty(
      'message',
      'Successfully applied for the job'
    );
    expect(res.body).toHaveProperty('id');

    jobApplicationId = res.body.id;
  });

  test('POST /api/jobs/:jobId/apply should not allow user to apply for same job', async () => {
    const applicationData = {
      firstName: 'John',
      lastName: 'Doe',
      coverLetter: 'I am excited to apply for this position.',
    };

    const res = await supertest(app)
      .post(`/api/jobs/${createdJobId}/apply`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(applicationData);

    expect(res.status).toBe(409);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toBe('Already applied for this job');
  });

  test('GET /api/user/applied-jobs should get user applied jobs', async () => {
    /**
     * As a user I should be able to view all the jobs I applied for.
     */
    const adminListJobsRes = await supertest(app)
      .get('/api/user/applied-jobs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminListJobsRes.status).toBe(200);
    expect(adminListJobsRes.body).toHaveProperty('applications', []);

    const res = await supertest(app)
      .get('/api/user/applied-jobs')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('applications');
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0]).toHaveProperty('state', 'pending');
    expect(res.body.applications[0]).toHaveProperty(
      'coverLetter',
      'I am excited to apply for this position.'
    );
  });

  test('DELETE /api/jobs/:jobId should not allow regular user to delete a job', async () => {
    const res = await supertest(app)
      .delete(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(401);

    const verifyNotDeletedResponse = await supertest(app)
      .get(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verifyNotDeletedResponse.status).toBe(200);
  });

  test('DELETE /api/jobs/:jobId should delete job and related applications', async () => {
    /**
     * As an admin user I should be able to delete a job.
     */
    expect(jobApplicationId).not.toBeNull();
    expect(
      await JobApplicationModel.exists({ _id: jobApplicationId })
    ).toBeTruthy();

    const res = await supertest(app)
      .delete(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);

    const verifyDeletedResponse = await supertest(app)
      .get(`/api/jobs/${createdJobId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyDeletedResponse.status).toBe(404);
    expect(
      await JobApplicationModel.exists({ _id: jobApplicationId })
    ).not.toBeTruthy();
  });
});
