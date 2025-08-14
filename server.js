require('dotenv').config();
const express = require('express');  // Express.js permite definir rutas para diferentes URLs de la aplicación
const bodyParser = require('body-parser'); // para parsear el JSON
const mysql = require('mysql2/promise'); // usar mysql2/promise para manejar promesas
const cors = require('cors'); //   
const fs = require('fs');  //
const path = require('path');  //

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '6466O',
    database: process.env.DB_NAME || 'pd_samuel_monsalve_gosling'
};

// Conexión a la base de datos
let connection;
async function initDB() {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a MySQL');
}
initDB();

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// CRUD para Clientes ------------------------------------------------

// Crear cliente
app.post('/api/customers', async (req, res, next) => {
    try {
        const { name, identification_number, address, phone, email } = req.body;
        
        if (!name || !identification_number || !address || !phone || !email) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [result] = await connection.execute(
            'INSERT INTO customers (name, identification_number, address, phone, email) VALUES (?, ?, ?, ?, ?)',
            [name, identification_number, address, phone, email]
        );
        
        res.status(201).json({ 
            message: 'Cliente creado exitosamente',
            customer_id: result.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El número de identificación ya existe' });
        }
        next(error);
    }
});

// Obtener todos los clientes
app.get('/api/customers', async (req, res, next) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM customers ORDER BY name');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Obtener un cliente específico
app.get('/api/customers/:id', async (req, res, next) => {
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM customers WHERE customer_id = ?', 
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// Actualizar cliente
app.put('/api/customers/:id', async (req, res, next) => {
    try {
        const { name, identification_number, address, phone, email } = req.body;
        
        if (!name || !identification_number || !address || !phone || !email) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [result] = await connection.execute(
            'UPDATE customers SET name = ?, identification_number = ?, address = ?, phone = ?, email = ? WHERE customer_id = ?',
            [name, identification_number, address, phone, email, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El número de identificación ya existe' });
        }
        next(error);
    }
});

// Eliminar cliente
app.delete('/api/customers/:id', async (req, res, next) => {
    try {
        const [result] = await connection.execute(
            'DELETE FROM customers WHERE customer_id = ?', 
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: 'No se puede eliminar el cliente porque tiene transacciones asociadas' 
            });
        }
        next(error);
    }
});

// CONSULTAS AVANZADAS --------------------------------------------

// 1. Total pagado por cada cliente
app.get('/api/reports/total-paid', async (req, res, next) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                c.customer_id,
                c.name,
                c.identification_number,
                SUM(t.amount) AS total_paid,
                COUNT(t.transaction_id) AS transactions_count
            FROM customers c
            JOIN transactions t ON c.customer_id = t.customer_id
            WHERE t.status = 'Completada'
            GROUP BY c.customer_id, c.name, c.identification_number
            ORDER BY total_paid DESC
        `);
        
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// 2. Facturas pendientes
app.get('/api/reports/pending-invoices', async (req, res, next) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                i.invoice_id,
                i.number_invoices,
                i.billed_amount,
                i.paid_amount,
                (i.billed_amount - i.paid_amount) AS pending_amount,
                c.customer_id,
                c.name AS customer_name,
                c.email,
                t.transaction_id,
                t.amount AS transaction_amount,
                t.status AS transaction_status,
                t.transaction_datetime
            FROM invoices i
            JOIN customers c ON i.customer_id = c.customer_id
            LEFT JOIN transactions t ON i.invoice_id = t.invoice_id
            WHERE i.paid_amount < i.billed_amount
            ORDER BY pending_amount DESC
        `);
        
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// 3. Transacciones por plataforma
app.get('/api/reports/transactions-by-platform/:platform_id', async (req, res, next) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                t.transaction_id,
                t.transaction_datetime,
                t.amount,
                t.status,
                p.name AS platform_name,
                c.customer_id,
                c.name AS customer_name,
                i.number_invoices,
                i.billing_period
            FROM transactions t
            JOIN platforms p ON t.platform_id = p.platform_id
            JOIN customers c ON t.customer_id = c.customer_id
            JOIN invoices i ON t.invoice_id = i.invoice_id
            WHERE t.platform_id = ?
            ORDER BY t.transaction_datetime DESC
        `, [req.params.platform_id]);
        
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Carga masiva desde CSV (Punto extra)
app.post('/api/import-data', async (req, res, next) => {
    try {
        const { exec } = require('child_process');
        const scriptPath = path.join(__dirname, 'database', 'import_data.py');
        
        exec(`python ${scriptPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error en importación:', stderr);
                return res.status(500).json({ 
                    error: 'Error en la importación',
                    details: stderr 
                });
            }
            
            console.log('Importación exitosa:', stdout);
            res.json({ 
                message: 'Datos importados correctamente',
                output: stdout 
            });
        });
    } catch (error) {
        next(error);
    }
});

// Obtener todas las transacciones
app.get('/api/transactions', async (req, res, next) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                t.*,
                c.name AS customer_name,
                p.name AS platform_name,
                i.number_invoices AS invoice_number
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.customer_id
            LEFT JOIN platforms p ON t.platform_id = p.platform_id
            LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
            ORDER BY t.transaction_datetime DESC
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});