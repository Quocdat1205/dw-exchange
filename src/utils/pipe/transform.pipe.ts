import { ForbiddenException } from "@config/exception.config";

export class Transformation {
  public static parseStringToNumber(value: string): number | undefined {
    const explodedValues = typeof value === "string";

    if (!explodedValues || !value) return undefined;

    if (parseInt(value) < 0) return undefined;

    return parseInt(value);
  }

  public static checkPositive(value: string): number | undefined {
    if (parseFloat(value) < 0) return undefined;

    return parseFloat(value);
  }

  public static parseStringToFloat(value: string): number | undefined {
    if (!value) return undefined;

    if (parseFloat(value) < 0) return undefined;

    return parseFloat(value);
  }

  public static parseStringToBoolean(value: string): boolean {
    const check = Boolean(value);

    if (!check) return;

    const bool = value === "true";

    return bool;
  }

  public static checkStringIsNumber(
    value: string,
  ): string | ForbiddenException {
    const explodedValues = +value;

    if (Number.isNaN(explodedValues)) {
      return new ForbiddenException("Id wrong, please check again!");
    }

    return value;
  }

  public static trimString(value: string | undefined): string {
    return value.trim();
  }

  public static lowerCaseString(value: string | undefined): string {
    return value.toLowerCase();
  }

  public static lowerCaseAndTrimString(value: string | undefined): string {
    return value.toLowerCase().trim();
  }

  public static upperCaseString(value: string | undefined): string {
    return value.toUpperCase().trim();
  }
}
