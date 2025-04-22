import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER_NAME,
//   port: process.env.DB_PORT,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   ssl: { rejectUnauthorized: false },
//   search_path: ["public"],
// });

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BZ_Base",
  password: "1234",
  port: 5432,
});

async function connection() {
  try {
    await pool.connect();
    console.log("Database Successfully Connected");
  } catch (error) {
    console.log("Database not connected");
    console.log(error);
  }
}

export default connection;
export { pool };
