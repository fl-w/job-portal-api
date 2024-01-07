/**
 * @openapi
 * tags:
 *   name: Jobs
 *   description: Job-related APIs
 */

import { Request, requireUser, requireRole } from '../middleware';
import express from 'express';
import { JobModel } from '../models/job.model';
import mongoose from 'mongoose';
import { JobApplicationModel } from '../models/application.model';
import { applicationSchema, jobSchema } from '../schemas';

const router = express.Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: List all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Successfully retrieved jobs
 *         content:
 *           application/json:
 *             example:
 *               count: 2
 *               jobs:
 *                 - title: Software Engineer
 *                   description: Exciting software engineering role
 *                   company: ABC Tech
 *                   salary: { currency: 'USD', min: 80000, max: 120000 }
 *                 - title: Data Scientist
 *                   description: Analyzing and interpreting complex data sets
 *                   company: XYZ Analytics
 *                   salary: { currency: 'GBP', min: 90000, max: 130000 }
 */
router.get('/', async (_: Request, res: express.Response) => {
  const jobs = await JobModel.find();
  const count = jobs.length;

  res.status(200).json({ count, jobs: jobs.map((job) => job.toObject()) });
});

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Add a new job (admin only)
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job added successfully
 *         content:
 *           application/json:
 *             example:
 *               title: Software Engineer
 *               description: Exciting software engineering role
 *               company: ABC Tech
 *               salary: { currency: 'USD', min: 80000, max: 120000 }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  requireRole('admin'),
  async (req: Request, res: express.Response) => {
    const validatedData = jobSchema.parse(req.body);
    const newJob = new JobModel(validatedData);
    await newJob.save();

    res.status(201).json(newJob.toObject());
  }
);

/**
 * automatically validate job id
 */
router.all('/:jobId', (req, res, next) => {
  const jobId = req.params.jobId;
  if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(404).json({ errors: ['Invalid job ID'] });
  }
  next();
});

/**
 * @openapi
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get details of a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID of the job to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved job details
 *       404:
 *         description: Job not found
 */
router.get('/:jobId', async (req: Request, res: express.Response) => {
  const job = await JobModel.findById(req.params.jobId);

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.status(200).json(job.toObject());
});

/**
 * @openapi
 * /api/jobs/{jobId}/:
 *   post:
 *     summary: Apply for a specific job
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to apply for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       201:
 *         description: Successfully applied for the job
 *       400:
 *         description: Bad Request (e.g., already applied)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 *       409:
 *         description: Already applied for job
 */
router.post(
  '/:jobId/apply',
  requireUser,
  async (req: Request, res: express.Response) => {
    const jobId = req.params.jobId;
    const userId = req.token.sub;
    const application = applicationSchema.parse(req.body);

    const existingApplication = await JobApplicationModel.findOne({
      jobId,
      userId,
    });

    if (existingApplication) {
      return res.status(409).json({ errors: ['Already applied for this job'] });
    }

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ errors: ['Job not found'] });
    }

    if (!job.active)
      return res.status(409).json({ errors: ['Job not active'] });

    const newApplication = new JobApplicationModel({
      jobId,
      userId,
      ...application,
    });

    await newApplication.save();
    res
      .status(201)
      .json({ id: newApplication.id, message: 'Successfully applied for the job' });
  }
);

/**
 * @openapi
 * /api/jobs/{jobId}:
 *   delete:
 *     summary: Delete a job (admin only)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         description: ID of the job to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.delete(
  '/:jobId',
  requireRole('admin'),
  async (req: Request, res: express.Response) => {
    const jobId = req.params.jobId;
    const deletedJob = await JobModel.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.status(404).json({ errors: ['Job not found'] });
    }

    return res.status(204).json();
  }
);

/**
 * @openapi
 * /api/jobs/{jobId}:
 *   put:
 *     summary: Update a specific job (admin only)
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Successfully updated the job
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.put(
  '/:jobId',
  requireRole('admin'),
  async (req: Request, res: express.Response) => {
    const { jobId } = req.params;
    const update = jobSchema.partial().parse(req.body);

    const existingJob = await JobModel.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({ errors: ['Job not found'] });
    }

    const updatedJob = await JobModel.findByIdAndUpdate(jobId, update);
    if (!updatedJob) {
      return res.status(500).json({ errors: ['Failed to update the job'] });
    }

    res.status(200).json(existingJob.toObject());
  }
);

export default router;
