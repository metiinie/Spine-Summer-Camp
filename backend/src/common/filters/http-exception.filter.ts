import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that:
 * 1. Returns structured JSON for all HTTP exceptions
 * 2. Maps Prisma-specific errors to meaningful HTTP status codes
 * 3. Never leaks internal details to the client for unhandled errors
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && 'message' in res
        ? (res as any).message
        : exception.message;
    } else if (this.isPrismaKnownError(exception)) {
      // Map Prisma error codes to HTTP status codes
      const prismaResult = this.handlePrismaError(exception as PrismaKnownError);
      status = prismaResult.status;
      message = prismaResult.message;
      // Log the real error internally but never expose it to the client
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Check if an error is a Prisma PrismaClientKnownRequestError.
   * We duck-type instead of importing the Prisma class to keep the filter decoupled.
   */
  private isPrismaKnownError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const err = error as Record<string, unknown>;
    return (
      typeof err.code === 'string' &&
      err.code.startsWith('P') &&
      err.constructor?.name === 'PrismaClientKnownRequestError'
    );
  }

  private handlePrismaError(error: PrismaKnownError): { status: number; message: string } {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(', ')
          : 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${target} already exists`,
        };
      }
      case 'P2025':
        // Record not found (e.g. update/delete on non-existent row)
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        // Foreign key constraint failure
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Related record not found',
        };
      default:
        // Log unhandled Prisma codes but return generic 500
        this.logger.error(`Unhandled Prisma error code ${error.code}`, error);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        };
    }
  }
}

/** Minimal type for duck-typed Prisma errors */
interface PrismaKnownError {
  code: string;
  meta?: Record<string, unknown>;
  message?: string;
}
