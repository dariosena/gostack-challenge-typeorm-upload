import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let categoryDb = await categoryRepository.findOne({
      where: { title: category },
    });

    if (categoryDb === undefined) {
      categoryDb = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryDb);
    }

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();

      if (value > total) {
        throw new AppError('Outcome value bigger than total balance.');
      }
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryDb,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
