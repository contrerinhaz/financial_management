import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {pool} from "../db/connection.js"

export async function loadTransactionsToDataBase() {
    const routeFile = path.resolve('server/data/02_transactions.csv');
    const transactions = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(routeFile)
            .pipe(csv())
            .on("data", (row) => {
                transactions.push([
                    row.id_transaction,
                    row.datetime_transaction,
                    row.transaction_amount,
                    row.status_transaction,
                    row.transaction_type
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO transactions (id_transaction,datetime_transaction,transaction_amount,status_transaction,transaction_type) VALUES ?';
                    const [result] = await pool.query(sql, [transactions]);

                    console.log(`was uploaded ${result.affectedRows} Transactions.`);
                    resolve();
                } catch (error) {
                    console.error('upload failed:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('CSV Transactions reading failure:', err.message);
                reject(err);
            });
    });
}

