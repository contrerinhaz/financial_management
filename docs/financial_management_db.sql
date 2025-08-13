DROP DATABASE IF EXISTS financial_management_db;
create database financial_management_db;
use financial_management_db;

create table customers (
	id_customer int primary key,
    full_name varchar(250),
    number_identification int unique,
    address varchar(150),
    phone varchar(200),
    email varchar(150) unique,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

create table transactions (
	id_transaction varchar(100) primary key,
    datetime_transaction datetime,
    transaction_amount int,
    status_transaction enum('Pendiente', 'Fallida', 'Completada'),
    transaction_type enum('pago de factura'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

create table invoices (
    invoice_number varchar(150) primary key,
    billing_invoice varchar(100),
    invoiced_amount int,
    paid_amount int,
    platform_type enum('Nequi', 'Daviplata'),
    id_transaction varchar(100) not null,
    id_customer int not null,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    foreign key (id_transaction) references transactions(id_transaction),
    foreign key (id_customer) references customers(id_customer)
);
