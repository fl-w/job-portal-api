import { requireUser, Request } from '../middleware';
import express from 'express';
import { UserModel, JobApplicationModel } from '../models';

/**
 * @openapi
 * tags:
 *   name: User
 *   description: User profile-related APIs
 */
const router = express.Router();

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get user profile details
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user profile details
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/profile',
  requireUser,
  async (req: Request, res: express.Response) => {
    const user = await UserModel.findById(req.token.sub);
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      appliedJobs: user.appliedJobs,
    });
  }
);

/**
 * @openapi
 * /api/user/applied-jobs:
 *   get:
 *     summary: Get all jobs applied by the user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with jobs applied by the user
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/applied-jobs',
  requireUser,
  async (req: Request, res: express.Response) => {
    const userId = req.token.sub;
    const userApplications = await JobApplicationModel.find({ userId });

    res
      .status(200)
      .json({ applications: userApplications.map((a) => a.toObject()) });
  }
);

export default router;
