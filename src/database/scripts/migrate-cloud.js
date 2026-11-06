const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function addColumnIfNotExists(conn, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  );
  if (rows.length === 0) {
    console.log(`Adding column ${table}.${column}...`);
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`  Added ${table}.${column}`);
  } else {
    console.log(`Column ${table}.${column} already exists.`);
  }
}

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '28153'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected to Aiven MySQL, updating columns...');

  // 1. users
  await addColumnIfNotExists(conn, 'users', 'city', 'VARCHAR(100) NULL AFTER full_name');
  await addColumnIfNotExists(conn, 'users', 'bio', 'TEXT NULL AFTER city');
  await addColumnIfNotExists(conn, 'users', 'refresh_token_hash', 'VARCHAR(64) NULL AFTER account_status');
  await addColumnIfNotExists(conn, 'users', 'sports', 'TEXT NULL AFTER refresh_token_hash');

  // 2. tournaments
  await addColumnIfNotExists(conn, 'tournaments', 'description', 'TEXT NULL AFTER tournament_name');
  await addColumnIfNotExists(conn, 'tournaments', 'rules', 'TEXT NULL AFTER description');
  await addColumnIfNotExists(conn, 'tournaments', 'banner_image_url', 'TEXT NULL AFTER rules');
  await addColumnIfNotExists(conn, 'tournaments', 'city', 'VARCHAR(100) NULL AFTER banner_image_url');
  await addColumnIfNotExists(conn, 'tournaments', 'min_participating_teams', 'INT NOT NULL DEFAULT 2 AFTER tournament_format');
  await addColumnIfNotExists(conn, 'tournaments', 'prize_pool', 'VARCHAR(100) NULL AFTER registration_fee');
  await addColumnIfNotExists(conn, 'tournaments', 'registration_deadline', 'DATE NULL AFTER prize_pool');
  await addColumnIfNotExists(conn, 'tournaments', 'updated_at', 'DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at');

  // 3. teams
  await addColumnIfNotExists(conn, 'teams', 'suspension_reason', 'TEXT NULL AFTER status');
  await addColumnIfNotExists(conn, 'teams', 'suspension_duration', 'VARCHAR(50) NULL AFTER suspension_reason');
  await addColumnIfNotExists(conn, 'teams', 'suspension_notes', 'TEXT NULL AFTER suspension_duration');
  await addColumnIfNotExists(conn, 'teams', 'suspended_at', 'TIMESTAMP NULL AFTER suspension_notes');
  await addColumnIfNotExists(conn, 'teams', 'suspended_by', 'VARCHAR(100) NULL AFTER suspended_at');

  // 4. tournament_brackets
  await addColumnIfNotExists(conn, 'tournament_brackets', 'round_name', 'VARCHAR(50) NULL AFTER round_number');
  await addColumnIfNotExists(conn, 'tournament_brackets', 'team1_id', 'BIGINT NULL AFTER match_sequence_in_round');
  await addColumnIfNotExists(conn, 'tournament_brackets', 'team2_id', 'BIGINT NULL AFTER team1_id');
  await addColumnIfNotExists(conn, 'tournament_brackets', 'winner_id', 'BIGINT NULL AFTER team2_id');

  await conn.end();
  console.log('--- Migration completed successfully ---');
}

runMigration().catch(console.error);
