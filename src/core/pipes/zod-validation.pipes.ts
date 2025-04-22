import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodValidationPipes implements PipeTransform {
  constructor(private readonly schema: z.Schema) {}
  transform(payload: any) {
    const result = this.schema.safeParse(payload);

    if (!result.success) {
      throw new BadRequestException('Échec de la validation');
    }

    return result.data;
  }
}
