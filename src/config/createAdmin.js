import pool from "./database.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    const hash = await bcrypt.hash("admin123", 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET 
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role`,
      ["Admin", "admin@church.com", hash, "admin"],
    );

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@church.com");
    console.log("🔑 Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createAdmin();
