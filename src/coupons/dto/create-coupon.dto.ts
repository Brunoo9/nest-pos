import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty({ message: 'El nombre del cupón es obligatorio.' })
  name: string;

  @IsNotEmpty({ message: 'El porcentaje del cupón es obligatorio.' })
  @IsInt({ message: 'El porcentaje debe ser un entero.' })
  @Min(1, { message: 'El descuento mínimo es de 1.' })
  @Max(100, { message: 'El descuento máximo es de 100.' })
  percentage: number;

  @IsNotEmpty({ message: 'La fecha de expiración es obligatoria.' })
  @IsDateString({}, { message: 'La fecha no es válida.' })
  expirationDate: Date;
}
