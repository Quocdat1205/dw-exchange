import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  onApplicationShutdown() {
    console.log("The application has just ended!");
  }

  getHello(): string {
    return "Welcome to server!";
  }
}
