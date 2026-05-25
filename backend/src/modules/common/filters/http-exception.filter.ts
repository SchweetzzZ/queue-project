import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorResponseDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'object') {
        message = (res as any).message || res;
        errorResponseDetails = (res as any).error || null;
      } else {
        message = res;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Tratamento para erros conhecidos do Prisma
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[])?.join(', ') || 'field';
          message = `Um registro com este ${target} já existe.`;
          errorResponseDetails = 'Conflict';
          break;
        case 'P2025': // Record to update or delete not found
          status = HttpStatus.NOT_FOUND;
          message = 'Registro não encontrado para realizar a operação.';
          errorResponseDetails = 'Not Found';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Erro no banco de dados: ${exception.message}`;
          errorResponseDetails = 'Bad Request';
      }
      this.logger.warn(`Prisma Error (${exception.code}): ${exception.message}`);
    } else if (exception instanceof Error) {
      // Erro comum do JavaScript/Node
      message = exception.message;
      this.logger.error(`Unhandled Error: ${exception.message}`, exception.stack);
    } else {
      // Algo desconhecido
      this.logger.error('Unknown critical error occurred', exception);
    }

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
      error: errorResponseDetails || (HttpStatus[status] ? this.getHttpStatusLabel(status) : 'Error'),
    };

    response.status(status).json(errorBody);
  }

  private getHttpStatusLabel(status: number): string {
    switch (status) {
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 409: return 'Conflict';
      case 422: return 'Unprocessable Entity';
      case 500: return 'Internal Server Error';
      default: return 'Error';
    }
  }
}
