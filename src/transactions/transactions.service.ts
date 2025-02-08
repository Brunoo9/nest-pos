import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(
      async (transactionEntityManager) => {
        const transaction = new Transaction();
        const errors = [];

        const total = createTransactionDto.contents.reduce((acum, item) => {
          return acum + item.quantity * item.price;
        }, 0);
        transaction.total = total;

        if (createTransactionDto.coupon) {
          const coupon = await this.couponService.applyCoupon(
            createTransactionDto.coupon,
          );
          const discount = (coupon.percentage / 100) * total;
          console.log(discount);

          transaction.discount = discount;
          transaction.coupon = coupon.name;
          transaction.total -= discount;
        }

        for (const contents of createTransactionDto.contents) {
          // Le pasamos la entidad product para que sepa que tiene que buscar en productos
          const product = await transactionEntityManager.findOneBy(Product, {
            id: contents.productId,
          });

          if (!product) {
            errors.push(
              `El producto con el ID:${contents.productId} no existe. `,
            );
            throw new NotFoundException(errors);
          }

          if (product.inventory < contents.quantity) {
            errors.push(
              `No hay stock suficiente para realizar la compra del producto ${product.name}.`,
            );
            throw new BadRequestException(errors);
          }

          product.inventory -= contents.quantity;

          const transactionContents = new TransactionContents();
          transactionContents.price = contents.price;
          transactionContents.product = product;
          transactionContents.quantity = contents.quantity;
          transactionContents.transaction = transaction;

          await transactionEntityManager.save(transaction);
          await transactionEntityManager.save(transactionContents);
        }
      },
    );

    return 'Venta almacenada correctamente.';
  }

  findAll(transactionDate?: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true,
      },
    };
    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('La fecha no es válida.');
      }
      const start = startOfDay(date);
      const end = endOfDay(date);

      // search of the day's sales with start and end of the day
      options.where = {
        transactionDate: Between(start, end),
      };
    }
    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      relations: {
        contents: true,
      },
      where: {
        id,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`No se encontró la venta con el id: ${id}.`);
    }

    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);

    for (const contents of transaction.contents) {
      // Restore stock of products
      const product = await this.productRepository.findOneBy({
        id: contents.product.id,
      });

      product.inventory += contents.quantity;

      await this.productRepository.save(product);

      // Remove sales content
      const transactionContent =
        await this.transactionContentsRepository.findOneBy({ id: contents.id });

      if (transactionContent) {
        await this.transactionContentsRepository.remove(transactionContent);
      }
    }
    // Remove sales
    await this.transactionRepository.remove(transaction);

    return `Se eliminó la venta con el id: ${id} correctamente `;
  }
}
