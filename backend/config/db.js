const mysql = require('mysql2');
require('dotenv').config();

// Creamos la conexión de forma separada
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Bases en la nube (Render/Aiven) exigen SSL; en Docker local no se usa
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Verificamos la conexión al iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err.message);
    } else {
        console.log('Conectado exitosamente a la base de datos MySQL');
        connection.release();
    }
});

module.exports = db;