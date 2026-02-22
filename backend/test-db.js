require('dotenv').config();
const db = require('./src/config/db');

async function testConnection() {
    try {
        console.log('Testing connection to Supabase...');
        const res = await db.query('SELECT NOW() as current_time, version() as version;');
        console.log('Connection successful!');
        console.log('Time:', res.rows[0].current_time);
        console.log('Version:', res.rows[0].version);

        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\nFound tables:', tables.rows.map(t => t.table_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
