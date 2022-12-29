import { Injectable, Logger, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService extends Logger {
  public error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
  }

  public warn(message: any, context?: string) {
    super.warn(message, context);
  }

  public log(message: any, context?: string) {
    super.log(message, context);
  }

  public debug(message: any, context?: string) {
    super.debug(message, context);
  }

  public verbose(message: any, context?: string) {
    super.verbose(message, context);
  }
}
