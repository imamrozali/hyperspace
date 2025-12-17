import { sql } from 'drizzle-orm';
import { db } from './index';

async function rollback() {
  try {
    console.log('Rolling back database...');
    
    // Drop all tables and recreate schema
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    
    console.log('Database rolled back successfully');
    process.exit(1);
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollback();