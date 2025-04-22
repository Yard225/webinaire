import { IIDGenerator } from '../ports/fixed-id-generator.interface';
import { v4 } from 'uuid';

export class RandomIDGenerator implements IIDGenerator {
  generate(): string {
    return v4();
  }
}
