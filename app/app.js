const API_BASE = "http://localhost:3005"
let isEditing = false
let editingId = null

// DOM Elements
const form = document.getElementById("customerForm")
const formTitle = document.getElementById("form-title")
const submitBtn = document.getElementById("submitBtn")
const cancelBtn = document.getElementById("cancelBtn")
const messageDiv = document.getElementById("message")
const customersTable = document.getElementById("customersTable")

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadCustomers()
  form.addEventListener("submit", handleSubmit)
  cancelBtn.addEventListener("click", resetForm)
})

// Show message
function showMessage(message, type = "success") {
  const color = type === "success" ? "green" : "red"
  const bgColor = type === "success" ? "#d4edda" : "#f8d7da"
  messageDiv.innerHTML = `<div style="color: ${color}; background-color: ${bgColor}; padding: 10px; border: 1px solid ${color}; border-radius: 4px; margin: 10px 0;">${message}</div>`
  setTimeout(() => {
    messageDiv.innerHTML = ""
  }, 5000)
}

// Load all customers
async function loadCustomers() {
  try {
    const response = await fetch(`${API_BASE}/customers`)
    const customers = await response.json()

    if (customers.length === 0) {
      customersTable.innerHTML = '<tr><td colspan="7">No customers found</td></tr>'
      return
    }

    customersTable.innerHTML = customers
      .map(
        (customer) => `
            <tr>
                <td>${customer.id_customer}</td>
                <td>${customer.full_name}</td>
                <td>${customer.number_identification}</td>
                <td>${customer.address || "N/A"}</td>
                <td>${customer.phone || "N/A"}</td>
                <td>${customer.email || "N/A"}</td>
                <td>
                    <button class="edit-btn" data-id="${customer.id_customer}" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">Edit</button>
                    <button class="delete-btn" data-id="${customer.id_customer}" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">Delete</button>
                </td>
            </tr>
        `,
      )
      .join("")

    // Add event listeners to buttons
    addButtonEventListeners()
  } catch (error) {
    console.error("Error loading customers:", error)
    showMessage("Error loading customers", "error")
    customersTable.innerHTML = '<tr><td colspan="7">Error loading customers</td></tr>'
  }
}

// Add event listeners to edit and delete buttons
function addButtonEventListeners() {
  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id")
      editCustomer(id)
    })
  })

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id")
      deleteCustomer(id)
    })
  })
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault()

  const formData = {
    full_name: document.getElementById("fullName").value,
    number_identification: Number.parseInt(document.getElementById("numberIdentification").value),
    address: document.getElementById("address").value,
    phone: Number.parseInt(document.getElementById("phone").value) || null,
    email: document.getElementById("email").value,
  }

  try {
    let response
    if (isEditing) {
      response = await fetch(`${API_BASE}/customers/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
    } else {
      response = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
    }

    const result = await response.json()

    if (response.ok) {
      showMessage(result.message, "success")
      resetForm()
      loadCustomers()
    } else {
      showMessage(result.message || "Error processing request", "error")
    }
  } catch (error) {
    console.error("Error:", error)
    showMessage("Error processing request", "error")
  }
}

// Edit customer
async function editCustomer(id) {
  try {
    const response = await fetch(`${API_BASE}/customers/${id}`)
    const customers = await response.json()

    if (customers.length > 0) {
      const customer = customers[0]

      document.getElementById("customerId").value = customer.id_customer
      document.getElementById("fullName").value = customer.full_name
      document.getElementById("numberIdentification").value = customer.number_identification
      document.getElementById("address").value = customer.address || ""
      document.getElementById("phone").value = customer.phone || ""
      document.getElementById("email").value = customer.email || ""

      isEditing = true
      editingId = id
      formTitle.textContent = "Edit Customer"
      submitBtn.textContent = "Update Customer"
      cancelBtn.style.display = "inline-block"

      // Scroll to form
      document.getElementById("form-title").scrollIntoView({ behavior: "smooth" })
    }
  } catch (error) {
    console.error("Error loading customer:", error)
    showMessage("Error loading customer data", "error")
  }
}

// Delete customer with enhanced confirmation
async function deleteCustomer(id) {
  try {
    // First, get customer info to show in confirmation
    const response = await fetch(`${API_BASE}/customers/${id}`)
    const customers = await response.json()

    if (customers.length === 0) {
      showMessage("Customer not found", "error")
      return
    }

    const customer = customers[0]
    const confirmMessage = `Are you sure you want to delete "${customer.full_name}"?\n\nThis action cannot be undone.`

    if (!confirm(confirmMessage)) {
      return
    }

    const deleteResponse = await fetch(`${API_BASE}/customers/${id}`, {
      method: "DELETE",
    })

    const result = await deleteResponse.json()

    if (deleteResponse.ok) {
      showMessage(result.message, "success")
      loadCustomers()
    } else {
      // Enhanced error message for foreign key constraints
      if (result.message.includes("invoice")) {
        showMessage(
          `❌ ${result.message}\n\n💡 Tip: You need to delete all invoices for this customer first, or contact an administrator for help.`,
          "error",
        )
      } else {
        showMessage(result.message || "Error deleting customer", "error")
      }
    }
  } catch (error) {
    console.error("Error deleting customer:", error)
    showMessage("Error deleting customer", "error")
  }
}

// Reset form
function resetForm() {
  form.reset()
  document.getElementById("customerId").value = ""
  isEditing = false
  editingId = null
  formTitle.textContent = "Add New Customer"
  submitBtn.textContent = "Add Customer"
  cancelBtn.style.display = "none"
}
