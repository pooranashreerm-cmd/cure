import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    console.warn(`[Client Validation Notice] ${req.method} ${req.path} -> Invalid payload format`);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload format',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    console.warn(`[Client Auth Notice] ${req.method} ${req.path} -> Unauthorized or expired token`);
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication credentials are invalid or expired.',
      },
    });
    return;
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : typeof err.status === 'number' ? err.status : 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const errorMessage = err.message || (statusCode >= 500 ? 'An unexpected internal server error occurred.' : 'Invalid request');

  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.path} (${statusCode}) [${errorCode}]: ${errorMessage}`);
  } else {
    console.warn(`[Client Notice] ${req.method} ${req.path} (${statusCode}) [${errorCode}]: ${errorMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  });
};

