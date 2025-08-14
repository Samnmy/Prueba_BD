-- Script de creación completa para la base de datos Get-Content database/database.sql | mysql -u root -p
-- Elimina la base de datos existente si hay una con el mismo nombre
DROP DATABASE IF EXISTS pd_samuel_monsalve_gosling;

-- Crear la base de datos con codificación UTF-8
CREATE DATABASE pd_samuel_monsalve_gosling
CHARACTER SET utf8mb4 -- crea una base de datos con codificación UTF-8 para soportar caracteres multibyte
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos recién creada
USE pd_samuel_monsalve_gosling;

-- TABLA: platforms (Plataformas de pago)
CREATE TABLE platforms (
    platform_id INT NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Almacena la fecha y hora de creación
    CONSTRAINT uk_platform_name UNIQUE (name) -- Asegura que no haya plataformas duplicadas
) ENGINE=InnoDB; -- Motor de almacenamiento InnoDB

-- TABLA: customers (Clientes)
CREATE TABLE customers (
    customer_id INT NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identification_number BIGINT NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_customer_identification UNIQUE (identification_number),
    CONSTRAINT uk_customer_email UNIQUE (email)
) ENGINE=InnoDB;

-- TABLA: invoices (Facturas)
CREATE TABLE invoices (
    invoice_id INT NOT NULL PRIMARY KEY,
    number_invoices VARCHAR(20) NOT NULL,
    billing_period DATE NOT NULL,
    billed_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_invoice_number UNIQUE (number_invoices),
    CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLA: transactions (Transacciones)
CREATE TABLE transactions (
    transaction_id VARCHAR(20) PRIMARY KEY,
    transaction_datetime DATETIME NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    customer_id INT NOT NULL,
    platform_id INT NOT NULL,
    invoice_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_customer FOREIGN KEY (customer_id) -- Relación con la tabla customers 
        REFERENCES customers(customer_id) ON DELETE CASCADE, -- on delete cascade se asegura de que al eliminar un cliente, se eliminen también sus transacciones
    CONSTRAINT fk_transaction_platform FOREIGN KEY (platform_id) -- Relación con la tabla platforms
        REFERENCES platforms(platform_id) ON DELETE CASCADE, 
    CONSTRAINT fk_transaction_invoice FOREIGN KEY (invoice_id) -- Relación con la tabla invoices
        REFERENCES invoices(invoice_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- Índices para customers
CREATE INDEX idx_customer_name ON customers(name);
CREATE INDEX idx_customer_identification ON customers(identification_number);

-- Índices para invoices
CREATE INDEX idx_invoice_customer ON invoices(customer_id);
CREATE INDEX idx_invoice_period ON invoices(billing_period);
CREATE INDEX idx_invoice_number ON invoices(number_invoices);

-- Índices para transactions
CREATE INDEX idx_transaction_customer ON transactions(customer_id);
CREATE INDEX idx_transaction_platform ON transactions(platform_id);
CREATE INDEX idx_transaction_invoice ON transactions(invoice_id);
CREATE INDEX idx_transaction_datetime ON transactions(transaction_datetime);
CREATE INDEX idx_transaction_status ON transactions(status);

-- DATOS INICIALES ESENCIALES
-- Insertar plataformas de pago básicas
INSERT INTO platforms (platform_id, name) VALUES 
(1, 'Nequi'),
(2, 'Daviplata');

-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- Procedimiento para limpiar toda la base de datos
DELIMITER //
CREATE PROCEDURE reset_database()
BEGIN
    -- Deshabilitar verificaciones de clave foránea temporalmente
    SET FOREIGN_KEY_CHECKS = 0;
    
    -- Truncar todas las tablas (excepto platforms)
    TRUNCATE TABLE transactions; -- Truncar la tabla de transacciones 
    TRUNCATE TABLE invoices;
    TRUNCATE TABLE customers;
    
    -- Reiniciar los autoincrementos
    ALTER TABLE customers AUTO_INCREMENT = 1;
    ALTER TABLE invoices AUTO_INCREMENT = 1;
    
    -- Volver a insertar plataformas básicas
    INSERT IGNORE INTO platforms (platform_id, name) VALUES 
    (1, 'Nequi'),
    (2, 'Daviplata');
    
    -- Reactivar verificaciones
    SET FOREIGN_KEY_CHECKS = 1;
    
    SELECT 'Base de datos reiniciada correctamente' AS message;
END //
DELIMITER ;