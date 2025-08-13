import mysql from "mysql2/promise"

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'coder',   
  database: 'financial_management_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('the connection with the database was completed.')
        connection.release();
    } catch (error) {
        console.log('there was an error connecting to the database:', error.message)
    }
    
}

testConnection();