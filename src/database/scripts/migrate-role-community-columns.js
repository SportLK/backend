const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sportlk_db',
};

async function addColumn(connection, table, column, definition) {
  const [columns] = await connection.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [config.database, table, column],
  );
  if (columns.length) {
    console.log(`${table}.${column} is already present.`);
    return;
  }
  await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`Added ${table}.${column}.`);
}

async function ensureSportTypes(connection, table) {
  const [columns] = await connection.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE 'sport_type'`,
  );
  const currentType = columns[0]?.Type || '';
  const requiredSports = ['CRICKET', 'FOOTBALL', 'FUTSAL', 'BADMINTON', 'BASKETBALL', 'VOLLEYBALL'];
  if (!requiredSports.every((sport) => currentType.includes(`'${sport}'`))) {
    await connection.query(
      `ALTER TABLE \`${table}\` MODIFY COLUMN \`sport_type\` ENUM('CRICKET','FOOTBALL','FUTSAL','BADMINTON','BASKETBALL','VOLLEYBALL') NOT NULL`,
    );
    console.log(`Updated ${table}.sport_type to support all app sports.`);
  } else {
    console.log(`${table}.sport_type already supports all app sports.`);
  }
}

async function migrate() {
  const connection = await mysql.createConnection(config);
  try {
    await addColumn(connection, 'role_applications', 'reviewed_by_organizer_id', 'BIGINT NULL AFTER reviewed_by_admin_id');
    await addColumn(connection, 'role_applications', 'assigned_organizer_id', 'BIGINT NULL AFTER user_id');
    await addColumn(connection, 'community_posts', 'headline', "VARCHAR(120) NOT NULL DEFAULT '' AFTER sport");
    await ensureSportTypes(connection, 'teams');
    await ensureSportTypes(connection, 'tournaments');
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error(`Database migration failed: ${error.message}`);
  process.exitCode = 1;
});
