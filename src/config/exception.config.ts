import { HttpException, HttpStatus } from "@nestjs/common";
import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";
import { IncomingMessage } from "http";
import { CustomExceptionDto } from "src/type/rest.type";

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UnAuthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class CreatedException extends HttpException {
  constructor(data: any) {
    super(data, HttpStatus.CREATED);
  }
}

export class Success extends HttpException {
  constructor(data: any) {
    super(data, HttpStatus.OK);
  }
}

export class InternalError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  return String(exception);
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IncomingMessage>();
    const statusCode = getStatusCode(exception);
    const message = getErrorMessage(exception);

    response.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode,
      message,
    });
  }
}

export const CustomException = (
  props: CustomExceptionDto,
): CustomExceptionDto => {
  return {
    ...props,
    timestamp: new Date().toISOString(),
  };
};
