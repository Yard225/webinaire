import { IDateGenerator } from '../ports/fixed-date-generator.interface';

export class CurrentDateGenerator implements IDateGenerator {
  now(): Date {
    return new Date();
  }
}
