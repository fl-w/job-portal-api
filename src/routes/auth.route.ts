import express from 'express';
import { UserModel } from '../models';
import { hashPassword, comparePasswords, generateToken } from '../services';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User authentication APIs
 */
const router = express.Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signup'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User with this email already exists
 */
router.post('/signup', async (req: express.Request, res: express.Response) => {
  const { email, firstName, lastName, password } = signupSchema.parse(req.body);
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return res
      .status(400)
      .json({ errors: ['User with this email already exists.'] });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = new UserModel({
    email,
    firstName,
    lastName,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({ message: 'User registered successfully.' });
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', async (req: express.Request, res: express.Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await UserModel.findOne({ email });
  const passwordMatch =
    user && (await comparePasswords(password, user.password));

  if (!passwordMatch) {
    return res.status(401).json({ errors: ['Invalid email or password.'] });
  }

  const token = generateToken(user);
  return res.status(200).json({ token });
});

export default router;
