const mysql = require('mysql2');
require('dotenv').config();

// Creamos la conexión de forma separada
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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