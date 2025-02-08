import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  @IsString({ message: 'El nombre del producto no es válido.' })
  name: string;

  //   image: string;
  @IsNotEmpty({ message: 'El precio del producto es obligatorio.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio del producto no es válido.' },
  )
  price: number;

  @IsNotEmpty({ message: 'El inventario del producto es obligatorio.' })
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'La cantidad de inventario no es válida.' },
  )
  inventory: number;

  @IsNotEmpty({ message: 'La categoría del producto es obligatoria.' })
  @IsInt({ message: 'La categoría del producto no es válida.' })
  categoryId: number;
}
