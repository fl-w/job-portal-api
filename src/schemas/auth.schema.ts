import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     Signup:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         lastName:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *       required:
 *         - firstName
 *         - email
 *         - lastName
 *         - password
 *       additionalProperties: false
 */
const signupSchema = z
  .object({
    firstName: z.string(),
    email: z.string().email(),
    lastName: z.string(),
    password: z.string().min(6),
  })
  .required()
  .strict();

/**
 * @openapi
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *       required:
 *         - email
 *         - password
 *       additionalProperties: false
 */

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  .required()
  .strict();

export { signupSchema, loginSchema };
