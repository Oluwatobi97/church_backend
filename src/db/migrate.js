import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('admin', 'council', 'member')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Devotions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Devotions table created');

    // Announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Announcements table created');

    // Attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        day VARCHAR(50) NOT NULL CHECK (day IN ('Tuesday', 'Friday', 'Sunday')),
        week_starting DATE NOT NULL,
        total_adults INTEGER DEFAULT 0,
        total_children INTEGER DEFAULT 0,
        total_offering DECIMAL(12, 2) DEFAULT 0,
        total_tithes DECIMAL(12, 2) DEFAULT 0,
        total_newcomers INTEGER DEFAULT 0,
        special_programme TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(day, week_starting)
      );
    `);
    console.log('✅ Attendance table created');

    // Timetable table
    await client.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 4),
        day VARCHAR(50) NOT NULL CHECK (day IN ('Tuesday', 'Friday', 'Sunday')),
        month VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        minister_name VARCHAR(255) NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week_number, day, month, year)
      );
    `);
    console.log('✅ Timetable table created');

    // Finance Income table
    await client.query(`
      CREATE TABLE IF NOT EXISTS finance_income (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        week_starting DATE NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Finance Income table created');

    // Finance Expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS finance_expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        week_starting DATE NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Finance Expenses table created');

    // Finance Balance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS finance_balance (
        id SERIAL PRIMARY KEY,
        week_starting DATE NOT NULL UNIQUE,
        balance_carried_down DECIMAL(12, 2) DEFAULT 0,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Finance Balance table created');

    // Create indexes for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_devotions_date ON devotions(date);
      CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
      CREATE INDEX IF NOT EXISTS idx_attendance_week ON attendance(week_starting);
      CREATE INDEX IF NOT EXISTS idx_timetable_month_year ON timetable(month, year);
      CREATE INDEX IF NOT EXISTS idx_finance_income_week ON finance_income(week_starting);
      CREATE INDEX IF NOT EXISTS idx_finance_expenses_week ON finance_expenses(week_starting);
    `);
    console.log('✅ Indexes created');

    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
};

createTables();
