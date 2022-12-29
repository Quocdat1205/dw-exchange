import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./modules/app/app.module";
import { LoggerService } from "./modules/logger/logger.service";
import { SwaggerModule } from "@nestjs/swagger";
import { appConfig } from "./config/app.config";
import { configSwagger } from "./config/swagger.config";
import env from "@utils/constant/env";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  appConfig(app);

  if (!env.isProduction) {
    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup("api", app, document);
  }

  app.enableShutdownHooks();

  await app.listen(env.PORT, () => {
    LoggerService.log(
      `Server running port: ${env.PORT}`,
      `🚀 API server listenning on http://localhost:${env.PORT}/api`,
    );
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
