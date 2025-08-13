import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import {pool} from "../db/connection.js"

export async function loadCustomersToDataBase() {
    const routeFile = path.resolve('server/data/01_customers.csv');
    const customers = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(routeFile)
            .pipe(csv())
            .on("data", (row) => {
                customers.push([
                    row.id_customer,
                    row.full_name.trim(),
                    row.number_identification,
                    row.address,
                    row.phone,
                    row.email
                ]);
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO customers (id_customer,full_name,number_identification,address,phone,email) VALUES ?';
                    const [result] = await pool.query(sql, [customers]);

                    console.log(`was uploaded ${result.affectedRows} customers.`);
                    resolve();
                } catch (error) {
                    console.error('upload failed:', error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error('CSV customers reading failure:', err.message);
                reject(err);
            });
    });
}

