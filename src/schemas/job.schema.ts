import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     SalaryRange:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           length: 3
 *         min:
 *           type: number
 *         max:
 *           type: number
 */
const salaryRangeSchema = z.object({
  currency: z.string().length(3).toUpperCase(),
  min: z.number(),
  max: z.number(),
});

/**
 * @openapi
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: string
 *           format: url
 *         location:
 *           type: string
 *         company:
 *           type: string
 *         salary:
 *           $ref: '#/components/schemas/SalaryRange'
 */
const jobSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    image: z.string().url().optional(),
    location: z.string().optional(),
    company: z.string(),
    salary: salaryRangeSchema.optional(),
  })
  .strict();

/**
 * @openapi
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         coverLetter:
 *           type: string
 *       required:
 *         - firstName
 *         - lastName
 *       additionalProperties: false
 */
const applicationSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    coverLetter: z.string().optional(),
  })
  .strict();

export { salaryRangeSchema, jobSchema, applicationSchema };
