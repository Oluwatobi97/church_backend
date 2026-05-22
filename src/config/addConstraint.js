import pool from "./database.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const addConstraint = async () => {
  try {
    // Check if the constraint already exists
    const checkResult = await pool.query(`
      SELECT 1 FROM pg_constraint WHERE conname = 'unique_category_week'
    `);

    if (checkResult.rows.length > 0) {
      console.log(
        'ℹ️ Constraint "unique_category_week" already exists. Skipping.',
      );
      process.exit(0);
    }

    // Add the unique constraint
    await pool.query(`
      ALTER TABLE finance_income 
      ADD CONSTRAINT unique_category_week UNIQUE (category, week_starting);
    `);

    console.log('✅ Constraint "unique_category_week" added successfully!');
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

addConstraint();
