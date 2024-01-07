import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ errors: err.errors });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ errors: [`'Bad JSON format: ${err}`] });
  }

  console.error('Something went wrong!', err);
  return res.status(500).json({ message: 'Internal server error' });
};
