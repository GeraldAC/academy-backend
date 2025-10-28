// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      const parsedData = schema.parse(dataToValidate);
      req[target] = parsedData;
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
  };
}
