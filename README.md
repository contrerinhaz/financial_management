# Financial Management System

A full-stack web application for managing customers, invoices, and transactions with a MySQL database backend and vanilla JavaScript frontend.

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

- **Customer Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Data Integrity**: Foreign key constraints with cascade delete functionality
- **Responsive UI**: Clean, user-friendly interface
- **Real-time Feedback**: Success/error messages for all operations
- **Data Validation**: Server-side and client-side validation
- **Transaction Safety**: Database transactions for data consistency

## 🛠 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with Promise support
- **ES6 Modules** - Modern JavaScript module system

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5** - Semantic markup
- **CSS3** - Styling and responsive design
- **Fetch API** - HTTP requests

### Database
- **MySQL** - Relational database management system

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MySQL Server** (v8.0 or higher)
- **MySQL Workbench** or any MySQL client (optional, for database management)

## 🚀 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd financial-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install express mysql2 csv-parser
   \`\`\`

3. **Configure MySQL connection**
   
   Edit \`server/db/connection.js\` with your MySQL credentials:
   \`\`\`javascript
   export const pool = mysql.createPool({
     host: 'localhost',
     user: 'your-username',        // Replace with your MySQL username
     password: 'your-password',    // Replace with your MySQL password
     database: 'financial_management_db',
     port: 3306,
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });
   \`\`\`

## 🗄 Database Setup

1. **Create the database**
   \`\`\`bash
   mysql -u your-username -p < docs/financial_management_db.sql
   \`\`\`

2. **Load sample data (optional)**
   \`\`\`bash
   node server/seeders/run_uploads.js
   \`\`\`

   This will populate the database with:
   - 100 sample customers
   - 100 sample transactions
   - 100 sample invoices

## 🏃‍♂️ Running the Application

1. **Start the server**
   \`\`\`bash
   node server/index.js
   \`\`\`

2. **Open your browser**
   
   Navigate to: \`http://localhost:3005\`

3. **Verify the connection**
   
   You should see:
   - "the connection with the database was completed." in the console
   - "the server is running on http://localhost:3005" in the console

## 🔌 API Endpoints

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/customers\` | Get all customers |
| GET | \`/customers/:id\` | Get customer by ID |
| POST | \`/customers\` | Create new customer |
| PUT | \`/customers/:id\` | Update customer |
| DELETE | \`/customers/:id\` | Delete customer (cascade delete) |

### Example API Usage

**Create Customer:**
\`\`\`bash
curl -X POST http://localhost:3005/customers \\
  -H "Content-Type: application/json" \\
  -d '{
    "full_name": "John Doe",
    "number_identification": 123456789,
    "address": "123 Main St",
    "phone": 5551234567,
    "email": "john@example.com"
  }'
\`\`\`

**Get All Customers:**
\`\`\`bash
curl http://localhost:3005/customers
\`\`\`

## 🎯 Usage

### Adding a Customer
1. Fill out the "Add New Customer" form
2. Click "Add Customer"
3. The customer will appear in the table below

### Editing a Customer
1. Click the "Edit" button next to any customer
2. The form will populate with existing data
3. Make your changes and click "Update Customer"

### Deleting a Customer
1. Click the "Delete" button next to any customer
2. Confirm the deletion in the popup
3. The customer and all associated invoices will be deleted

### Error Handling
- The system provides clear error messages for validation failures
- Foreign key constraints are handled gracefully
- All database operations are wrapped in transactions for data integrity

## 🔧 Configuration Options

### Database Connection
Modify \`server/db/connection.js\` to change:
- Host, port, username, password
- Connection pool settings
- Timeout configurations

### Server Settings
Modify \`server/index.js\` to change:
- Server port (default: 3005)
- CORS settings
- Static file serving

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify MySQL is running
- Check credentials in \`connection.js\`
- Ensure database exists

**Port Already in Use:**
- Change port in \`server/index.js\`
- Kill existing process: \`lsof -ti:3005 | xargs kill\`

**CORS Errors:**
- Server includes CORS headers
- Check browser console for specific errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Commit changes: \`git commit -am 'Add feature'\`
4. Push to branch: \`git push origin feature-name\`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Happy coding! 🚀**
