import { DocumentBuilder } from "@nestjs/swagger";

export const configSwagger = new DocumentBuilder()
  .setTitle("Exchange deposit and withdraw")
  .setDescription("Api exchange deposit and withdraw")
  .setVersion("1.0")
  .addBearerAuth(
    {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Enter JWT token",
      in: "header",
    },
    "JWT-auth", // This name here is important for matching up with @ApiBearerAuth() in your controller!
  )
  .build();
