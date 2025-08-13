import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {pool} from "../db/connection.js"

export async function loadInvoicesToDataBase() {
    const routeFile = path.resolve('server/data/03_invoices.csv');
    const invoices = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(routeFile)
            .pipe(csv())
            .on("data", (row) => {
                invoices.push([
                    
                    row.invoice_number,
                    row.billing_invoice,
                    row.invoiced_amount,
                    row.paid_amount,
                    row.platform_type,
                    row.id_transaction,
                    row.id_customer
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO invoices (invoice_number,billing_invoice,invoiced_amount,paid_amount,platform_type,id_transaction,id_customer) VALUES ?';
                    const [result] = await pool.query(sql, [invoices]);

                    console.log(`was uploaded ${result.affectedRows} Invoices.`);
                    resolve();
                } catch (error) {
                    console.error('upload failed:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('CSV Invoices reading failure:', err.message);
                reject(err);
            });
    });
}

