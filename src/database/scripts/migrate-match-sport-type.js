const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function migrateMatchSportType() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sportlk_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'matches' AND COLUMN_NAME = 'sport_type'`,
      [process.env.DB_NAME || 'sportlk_db'],
    );

    if (columns.length === 0) {
      await connection.query(
        `ALTER TABLE matches ADD COLUMN sport_type ENUM('CRICKET','FOOTBALL','FUTSAL','BADMINTON','BASKETBALL','VOLLEYBALL') NULL AFTER tournament_id`,
      );
      console.log('Added nullable matches.sport_type column.');
    } else {
      console.log('matches.sport_type already exists; no schema change needed.');
    }
  } finally {
    await connection.end();
  }
}

migrateMatchSportType().catch((error) => {
  console.error('Match schema migration failed:', error.code || error.message);
  process.exitCode = 1;
});
