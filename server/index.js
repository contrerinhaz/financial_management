import express from "express"
import { pool } from "./db/connection.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = express()

server.use(express.json())

// Servir archivos estáticos
server.use(express.static(path.join(__dirname, "../")))

// CORS para permitir peticiones desde el frontend
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})

// Servir el HTML directamente en la ruta principal
server.get("/", async (request, response) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer CRUD</title>
</head>
<body>
  <h1>Customer Management System</h1>
  
  <div id="message"></div>
  
  <!-- Form Section -->
  <div>
      <h2 id="form-title">Add New Customer</h2>
      <form id="customerForm">
          <input type="hidden" id="customerId">
          
          <label>Full Name:</label>
          <input type="text" id="fullName" required><br><br>
          
          <label>ID Number:</label>
          <input type="number" id="numberIdentification" required><br><br>
          
          <label>Address:</label>
          <input type="text" id="address"><br><br>
          
          <label>Phone:</label>
          <input type="tel" id="phone"><br><br>
          
          <label>Email:</label>
          <input type="email" id="email"><br><br>
          
          <button type="submit" id="submitBtn">Add Customer</button>
          <button type="button" id="cancelBtn" style="display: none;">Cancel</button>
      </form>
  </div>
  
  <hr>
  
  <!-- Table Section -->
  <div>
      <h2>Customers List</h2>
      <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>ID Number</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody id="customersTable">
              <tr>
                  <td colspan="7">Loading customers...</td>
              </tr>
          </tbody>
      </table>
  </div>

  <script>
      const API_BASE = '';
      let isEditing = false;
      let editingId = null;

      // DOM Elements
      const form = document.getElementById('customerForm');
      const formTitle = document.getElementById('form-title');
      const submitBtn = document.getElementById('submitBtn');
      const cancelBtn = document.getElementById('cancelBtn');
      const messageDiv = document.getElementById('message');
      const customersTable = document.getElementById('customersTable');

      // Initialize
      document.addEventListener('DOMContentLoaded', function() {
          loadCustomers();
          form.addEventListener('submit', handleSubmit);
          cancelBtn.addEventListener('click', resetForm);
      });

      // Show message
      function showMessage(message, type = 'success') {
          const color = type === 'success' ? 'green' : 'red';
          messageDiv.innerHTML = \`<div style="color: \${color}; padding: 10px; border: 1px solid \${color}; margin: 10px 0;">\${message}</div>\`;
          setTimeout(() => {
              messageDiv.innerHTML = '';
          }, 3000);
      }

      // Load all customers
      async function loadCustomers() {
          try {
              const response = await fetch(\`\${API_BASE}/customers\`);
              const customers = await response.json();
              
              if (customers.length === 0) {
                  customersTable.innerHTML = '<tr><td colspan="7">No customers found</td></tr>';
                  return;
              }
              
              customersTable.innerHTML = customers.map(customer => \`
                  <tr>
                      <td>\${customer.id_customer}</td>
                      <td>\${customer.full_name}</td>
                      <td>\${customer.number_identification}</td>
                      <td>\${customer.address || 'N/A'}</td>
                      <td>\${customer.phone || 'N/A'}</td>
                      <td>\${customer.email || 'N/A'}</td>
                      <td>
                          <button onclick="editCustomer(\${customer.id_customer})">Edit</button>
                          <button onclick="deleteCustomer(\${customer.id_customer})" style="color: red;">Delete</button>
                      </td>
                  </tr>
              \`).join('');
          } catch (error) {
              console.error('Error loading customers:', error);
              showMessage('Error loading customers', 'error');
              customersTable.innerHTML = '<tr><td colspan="7">Error loading customers</td></tr>';
          }
      }

      // Handle form submission
      async function handleSubmit(e) {
          e.preventDefault();
          
          const formData = {
              full_name: document.getElementById('fullName').value,
              number_identification: parseInt(document.getElementById('numberIdentification').value),
              address: document.getElementById('address').value,
              phone: parseInt(document.getElementById('phone').value) || null,
              email: document.getElementById('email').value
          };

          try {
              let response;
              if (isEditing) {
                  response = await fetch(\`\${API_BASE}/customers/\${editingId}\`, {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(formData)
                  });
              } else {
                  response = await fetch(\`\${API_BASE}/customers\`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(formData)
                  });
              }

              const result = await response.json();
              
              if (response.ok) {
                  showMessage(result.message, 'success');
                  resetForm();
                  loadCustomers();
              } else {
                  showMessage(result.message || 'Error processing request', 'error');
              }
          } catch (error) {
              console.error('Error:', error);
              showMessage('Error processing request', 'error');
          }
      }

      // Edit customer
      async function editCustomer(id) {
          try {
              const response = await fetch(\`\${API_BASE}/customers/\${id}\`);
              const customers = await response.json();
              
              if (customers.length > 0) {
                  const customer = customers[0];
                  
                  document.getElementById('customerId').value = customer.id_customer;
                  document.getElementById('fullName').value = customer.full_name;
                  document.getElementById('numberIdentification').value = customer.number_identification;
                  document.getElementById('address').value = customer.address || '';
                  document.getElementById('phone').value = customer.phone || '';
                  document.getElementById('email').value = customer.email || '';
                  
                  isEditing = true;
                  editingId = id;
                  formTitle.textContent = 'Edit Customer';
                  submitBtn.textContent = 'Update Customer';
                  cancelBtn.style.display = 'inline-block';
              }
          } catch (error) {
              console.error('Error loading customer:', error);
              showMessage('Error loading customer data', 'error');
          }
      }

      // Delete customer
      async function deleteCustomer(id) {
          if (!confirm('Are you sure you want to delete this customer?')) {
              return;
          }

          try {
              const response = await fetch(\`\${API_BASE}/customers/\${id}\`, {
                  method: 'DELETE'
              });

              const result = await response.json();
              
              if (response.ok) {
                  showMessage(result.message, 'success');
                  loadCustomers();
              } else {
                  showMessage(result.message || 'Error deleting customer', 'error');
              }
          } catch (error) {
              console.error('Error deleting customer:', error);
              showMessage('Error deleting customer', 'error');
          }
      }

      // Reset form
      function resetForm() {
          form.reset();
          document.getElementById('customerId').value = '';
          isEditing = false;
          editingId = null;
          formTitle.textContent = 'Add New Customer';
          submitBtn.textContent = 'Add Customer';
          cancelBtn.style.display = 'none';
      }
  </script>
</body>
</html>
  `

  response.send(htmlContent)
})

// GET all customers
server.get("/customers", async (request, response) => {
  try {
    const query = `SELECT * FROM customers ORDER BY id_customer DESC`
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

// GET customer by ID
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

    const query = `INSERT INTO customers (full_name, number_identification, address, phone, email) VALUES (?, ?, ?, ?, ?)`
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

    const query = `UPDATE customers SET full_name = ?, number_identification = ?, address = ?, phone = ?, email = ? WHERE id_customer = ?`
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

// DELETE - Delete customer
server.delete("/customers/:id_customer", async (request, response) => {
  try {
    const { id_customer } = request.params
    const query = `DELETE FROM customers WHERE id_customer = ?`
    const [result] = await pool.query(query, [id_customer])

    if (result.affectedRows === 0) {
      return response.status(404).json({
        status: "error",
        message: "Customer not found",
      })
    }

    return response.json({
      status: "success",
      message: "Customer deleted successfully",
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

server.listen(3005, async () => {
  console.log("Customer CRUD is now available directly at http://localhost:3005")
})
