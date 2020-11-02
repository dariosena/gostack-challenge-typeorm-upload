import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CSVLine {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const service = new CreateTransactionService();

    const csvFilePath = path.resolve(__dirname, '..', '..', filename);

    const importedTransactions = await this.loadCSV(csvFilePath);

    for (const importedTransaction of importedTransactions) {
      const transaction = await service.execute(importedTransaction);
      transactions.push(transaction);
    }

    return transactions;
  }

  private async loadCSV(csvFilePath: string): Promise<CSVLine[]> {
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      trim: true,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: CSVLine[] = [];

    parseCSV.on('data', line => {
      const title = line[0];
      const type = line[1];
      const value = Number(line[2]);
      const category = line[3];

      lines.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
