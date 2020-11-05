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
    const transactions: Transaction[] = await this.find();

    let income = 0;
    let outcome = 0;
    let total = 0;

    if (transactions.length > 0) {
      const reducer = (accumulator: number, value: number): number =>
        accumulator + value;

      const incomeValues = transactions.map(transaction => {
        return transaction.type === 'income' ? transaction.value : 0;
      });

      const outcomeValues = transactions.map(transaction => {
        return transaction.type === 'outcome' ? transaction.value : 0;
      });

      income = incomeValues.reduce(reducer);
      outcome = outcomeValues.reduce(reducer);
      total = income - outcome;

      return { income, outcome, total };
    }

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
