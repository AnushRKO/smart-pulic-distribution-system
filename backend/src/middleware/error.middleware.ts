import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
    });
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
