# Job Portal App

> This application serves as a playground to demonstrate a basic REST endpoint implementation in Node.js using Express and MongoDB.
> It's designed for educational purposes and showcases the fundamental concepts of building a simple API.

This Node.js application serves as a job portal with various features for both users and admins.
Below are instructions on how to set up and run the application.

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/fl-w/job-portal-api.git
   cd job-portal-app
   ```

## Start the application for development:

The application can started locally using node and pnpm on your native machine.
> Before running, modify the .env file and set the JWT_SECRET and MONGO_URI variables. (see .env.example).

   ```bash
   pnpm install # Install dependencies
   pnpm run dev
   ```

Navigate to [http://localhost:8080/docs](http://localhost:8080/docs) to access the application openapi docs.

Alternatively, use docker-compose to start the development (recommended)

  ```bash
   docker compose up job-portal-api-dev
  ```

### Production Deployment

To start the application in production mode using Docker Compose:

   ```bash
   docker-compose up -d job-portal-api
   ```

The application will be accessible at [http://localhost:8080](http://localhost:8080).

### Running Tests

To run the tests for this, run the command:

  ```bash
  pnpm test
  ```

### Database Helper Script

This helper script provides some helpful db utilities.

```bash
pnpm run helper-script <command> [arguments]
```

Available commands:

- `getuser <email>`: Print user document to stdout.
- `setrole <email> <role>`: Change user role.
- `cleardb`: Clear the database.

## Endpoints Overview

Refer to the OpenAPI docs in [`openapi.yaml`](https://github.com/fl-w/job-portal-api/blob/main/openapi.yaml) for endpoint details and functionalities.

### Authentication Endpoints

- **POST /api/auth/signup:**
  - Allows users to register with email, first name, last name, and a secure password.
- **POST /api/auth/login:**
  - Allows users to log in with their registered credentials.

### Job Endpoints

- **GET /api/jobs:**
  - Lists all available jobs.
- **GET /api/jobs/{jobId}:**
  - Retrieves details of a specific job.
- **POST /api/jobs:**
  - Allows admins to add a new job.
- **PUT /api/jobs/{jobId}:**
  - Allows admins to update a specific job.
- **DELETE /api/jobs/{jobId}:**
  - Allows admins to delete a job.
- **POST /api/jobs/{jobId}/apply:**
  - Allows users to apply for a specific job.

### User Endpoints

- **GET /api/user/profile:**
  - Retrieves user profile details.
- **GET /api/user/applied-jobs:**
  - Retrieves all jobs applied for by the user.
