import express from "express"
import { pool } from "./db/connection.js"
import path from "path"
import { fileURLToPath } from "url"

const server = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

server.use(express.json())

// CORS middleware
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})

// Serve static files from the root directory
server.use(express.static(path.join(__dirname, "../")))

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"))
})

server.get("/customers", async (request, response) => {
  try {
    const query = `select * from customers`

    const [rows] = await pool.query(query)

    return response.json(rows)
  } catch (error) {
    response.status(500).json({
      status: "error",
      endpoint: request.originalUrl,
      method: request.method,
      message: error.message,
    })
  }
})

server.get("/customers/:id_customer", async (request, response) => {
  try {
    const { id_customer } = request.params

    const [rows] = await pool.query(`SELECT * FROM customers WHERE id_customer = ?`, [id_customer])

    return response.json(rows)
  } catch (error) {
    response.status(500).json({
      status: "error",
      endpoint: request.originalUrl,
      method: request.method,
      message: error.message,
    })
  }
})

// POST - Create new customer
server.post("/customers", async (request, response) => {
  try {
    const { full_name, number_identification, address, phone, email } = request.body

    const query = `
            INSERT INTO customers (full_name, number_identification, address, phone, email) 
            VALUES (?, ?, ?, ?, ?)
        `

    const [result] = await pool.query(query, [full_name, number_identification, address, phone, email])

    return response.status(201).json({
      status: "success",
      message: "Customer created successfully",
      data: {
        id_customer: result.insertId,
        full_name,
        number_identification,
        address,
        phone,
        email,
      },
    })
  } catch (error) {
    return response.status(500).json({
      status: "error",
      endpoint: request.originalUrl,
      method: request.method,
      message: error.message,
    })
  }
})

// PUT - Update customer
server.put("/customers/:id_customer", async (request, response) => {
  try {
    const { id_customer } = request.params
    const { full_name, number_identification, address, phone, email } = request.body

    const query = `
            UPDATE customers 
            SET full_name = ?, number_identification = ?, address = ?, phone = ?, email = ?
            WHERE id_customer = ?
        `

    const [result] = await pool.query(query, [full_name, number_identification, address, phone, email, id_customer])

    if (result.affectedRows === 0) {
      return response.status(404).json({
        status: "error",
        message: "Customer not found",
      })
    }

    return response.json({
      status: "success",
      message: "Customer updated successfully",
      data: {
        id_customer: Number.parseInt(id_customer),
        full_name,
        number_identification,
        address,
        phone,
        email,
      },
    })
  } catch (error) {
    return response.status(500).json({
      status: "error",
      endpoint: request.originalUrl,
      method: request.method,
      message: error.message,
    })
  }
})

// DELETE - Delete customer (CASCADE DELETE)
server.delete("/customers/:id_customer", async (request, response) => {
  try {
    const { id_customer } = request.params

    // Iniciar transacción para asegurar consistencia
    await pool.query("START TRANSACTION")

    try {
      // 1. Eliminar todas las facturas del cliente
      const [invoicesResult] = await pool.query(`DELETE FROM invoices WHERE id_customer = ?`, [id_customer])

      // 2. Eliminar el cliente
      const [customerResult] = await pool.query(`DELETE FROM customers WHERE id_customer = ?`, [id_customer])

      if (customerResult.affectedRows === 0) {
        await pool.query("ROLLBACK")
        return response.status(404).json({
          status: "error",
          message: "Customer not found",
        })
      }

      // Confirmar transacción
      await pool.query("COMMIT")

      return response.json({
        status: "success",
        message: `Customer deleted successfully. ${invoicesResult.affectedRows} associated invoice(s) were also deleted.`,
      })
    } catch (error) {
      // Revertir transacción en caso de error
      await pool.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Delete error:", error)
    return response.status(500).json({
      status: "error",
      endpoint: request.originalUrl,
      method: request.method,
      message: error.message,
    })
  }
})

server.listen(3005, async () => {
  console.log("the server is running on http://localhost:3005")
})
