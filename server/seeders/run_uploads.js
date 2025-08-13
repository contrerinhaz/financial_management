import {loadCustomersToDataBase} from "./load_customers.js";
import {loadTransactionsToDataBase} from "./load_transactions.js";
import {loadInvoicesToDataBase} from "./load_invoices.js";

(async () => {
    try {
        console.log('running uploads...');

        await loadCustomersToDataBase()
        await loadTransactionsToDataBase()
        await loadInvoicesToDataBase()

        console.log('all uploads were successfully uploaded.');
    } catch (error) {
        console.error('error when uploading:', error.message);
    } finally {
        process.exit();
    }
})()