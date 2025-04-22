import { IIDGenerator } from '../ports/fixed-id-generator.interface';

export class FixedIDGenerator implements IIDGenerator {
  generate(): string {
    return 'id-1';
  }
}
