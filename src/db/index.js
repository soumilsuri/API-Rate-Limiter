import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connection;

export const connectDB = async () => {
  try {
    if (!connection || connection.connection._closing) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
      });

      console.log('Connected to the MySQL database!');
    }

    return connection;
  } catch (error) {
    console.error('MySQL connection error:', error);
    throw error;
  }
};
