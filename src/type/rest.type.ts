export class CustomExceptionDto {
  statusCode: number;
  data?: any;
  message?: string;
  error?: any;
  timestamp?: Date | string;
}
