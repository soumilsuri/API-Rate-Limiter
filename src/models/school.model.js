import { connectDB } from '../db/index.js'; 

let tableInitialized = false;

const initializeTable = async () => {
  if (tableInitialized) return;

  const db = await connectDB();

  // Creates the schools table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255),
      latitude FLOAT,
      longitude FLOAT
    )
  `);

  tableInitialized = true;
};

export const createSchool = async (school) => {
  await initializeTable();
  const db = await connectDB();
  const { name, address, latitude, longitude } = school;

  const [result] = await db.execute(
    'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
    [name, address, latitude, longitude]
  );

  return { id: result.insertId, ...school };
};

export const getAllSchools = async () => {
  await initializeTable();
  const db = await connectDB();
  const [rows] = await db.execute('SELECT * FROM schools');
  return rows;
};

export const getSchoolById = async (id) => {
  await initializeTable();
  const db = await connectDB();
  const [rows] = await db.execute('SELECT * FROM schools WHERE id = ?', [id]);
  return rows[0];
};

export const updateSchool = async (id, updates) => {
  await initializeTable();
  const db = await connectDB();
  const { name, address, latitude, longitude } = updates;

  await db.execute(
    'UPDATE schools SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?',
    [name, address, latitude, longitude, id]
  );

  return getSchoolById(id);
};

export const deleteSchool = async (id) => {
  await initializeTable();
  const db = await connectDB();
  await db.execute('DELETE FROM schools WHERE id = ?', [id]);
};
