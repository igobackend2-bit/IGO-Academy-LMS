const { createClient } = require('@supabase/supabase-js');
const pg = require('pg');

const url = 'https://kbdbbwsesdmfvkcurjmg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGJid3Nlc2RtZnZrY3Vyam1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk3NTM5NCwiZXhwIjoyMDk2NTUxMzk0fQ.286sCk1A5qGq01eR22rt2sekCWx0OYVKy5uo2ZTSwbE';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGJid3Nlc2RtZnZrY3Vyam1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NzUzOTQsImV4cCI6MjA5NjU1MTM5NH0.lO3CjQLlg4XaFTwbsPfjbTNkQXmrXE-7STJY-r9yBMc';

console.log('Testing Supabase REST Client...');
const supabase = createClient(url, serviceKey);

async function run() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('Supabase REST client connection failed:', error.message);
    } else {
      console.log('Supabase REST client successfully connected! Data sample:', data);
    }
  } catch (err) {
    console.error('Supabase REST client error:', err);
  }

  console.log('\nTesting Postgres Pool Connection...');
  const pool = new pg.Pool({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.kbdbbwsesdmfvkcurjmg',
    password: 'Igoskills@123',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Postgres successfully connected! Database time:', res.rows[0].now);
  } catch (err) {
    console.error('Postgres connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
