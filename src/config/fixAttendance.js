import pool from "./database.js";

const run = async () => {
  try {
    await pool.query(`
      ALTER TABLE attendance 
      DROP CONSTRAINT IF EXISTS attendance_day_check
    `);
    console.log("✅ Day constraint removed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(0);
  }
};

run();
