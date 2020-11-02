import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const reducer = (accumulator: number, value: number): number =>
      accumulator + value;

    const incomeValues = transactions.map(transaction => {
      return transaction.type === 'income' ? transaction.value : 0;
    });

    const outcomeValues = transactions.map(transaction => {
      return transaction.type === 'outcome' ? transaction.value : 0;
    });

    const income = incomeValues.reduce(reducer);
    const outcome = outcomeValues.reduce(reducer);

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
