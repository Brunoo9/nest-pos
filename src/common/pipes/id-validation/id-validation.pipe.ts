import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class IdValidationPipe extends ParseIntPipe {
  constructor() {
    // con super reescribimos un constructor padre , y reescribimos exceptionfactory
    super({
      exceptionFactory: () => new BadRequestException('El id no es válido.'),
    });
  }
}
