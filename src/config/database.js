import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Failed to connect to Neon database:", err.message);
  } else {
    console.log("✅ Connected to Neon database successfully!");
    release();
  }
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client:", err.message);
  process.exit(-1);
});

export default pool;
