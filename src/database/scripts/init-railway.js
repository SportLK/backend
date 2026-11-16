const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'sportlk_db',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true
};

async function initRailway() {
  if (!config.host || !config.user || !config.password) {
    throw new Error('Configure DB_HOST, DB_USER, and DB_PASSWORD in backend/.env before running database initialization.');
  }
  console.log('Connecting to the configured MySQL database...');
  const conn = await mysql.createConnection(config);
  console.log('Connected!');

  console.log('1. Creating the configured database if it does not exist...');
  const database = config.database.replace(/`/g, '``');
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await conn.query(`USE \`${database}\`;`);

  console.log('2. Executing init-schema.sql...');
  const initSqlPath = path.resolve(__dirname, 'init-schema.sql');
  const initSql = fs.readFileSync(initSqlPath, 'utf8')
    .replace(/^\s*CREATE DATABASE IF NOT EXISTS sportlk_db[\s\S]*?;\s*/im, '')
    .replace(/^\s*USE sportlk_db\s*;\s*/im, '');

  // The selected database is supplied through DB_NAME; the schema file must
  // not switch this connection back to a hard-coded database name.
  await conn.query(initSql);
  console.log('init-schema.sql executed successfully.');

  console.log('3. Running column additions and additional tables...');
  
  async function addCol(table, col, def) {
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [config.database, table, col]
    );
    if (rows.length === 0) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`);
      console.log(`  Added ${table}.${col}`);
    } else {
      console.log(`  Column ${table}.${col} already exists.`);
    }
  }

  // users columns
  await addCol('users', 'city', 'VARCHAR(100) NULL AFTER full_name');
  await addCol('users', 'bio', 'TEXT NULL AFTER city');
  await addCol('users', 'refresh_token_hash', 'VARCHAR(64) NULL AFTER account_status');
  await addCol('users', 'sports', 'TEXT NULL AFTER refresh_token_hash');
  await addCol('role_applications', 'reviewed_by_organizer_id', 'BIGINT NULL AFTER reviewed_by_admin_id');
  await addCol('role_applications', 'assigned_organizer_id', 'BIGINT NULL AFTER user_id');

  // tournaments columns
  await addCol('tournaments', 'description', 'TEXT NULL AFTER tournament_name');
  await addCol('tournaments', 'rules', 'TEXT NULL AFTER description');
  await addCol('tournaments', 'banner_image_url', 'TEXT NULL AFTER rules');
  await addCol('tournaments', 'city', 'VARCHAR(100) NULL AFTER banner_image_url');
  await addCol('tournaments', 'min_participating_teams', 'INT NOT NULL DEFAULT 2 AFTER tournament_format');
  await addCol('tournaments', 'prize_pool', 'VARCHAR(100) NULL AFTER registration_fee');
  await addCol('tournaments', 'registration_deadline', 'DATE NULL AFTER prize_pool');
  await addCol('tournaments', 'updated_at', 'DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at');

  // teams columns
  await addCol('teams', 'suspension_reason', 'TEXT NULL AFTER status');
  await addCol('teams', 'suspension_duration', 'VARCHAR(50) NULL AFTER suspension_reason');
  await addCol('teams', 'suspension_notes', 'TEXT NULL AFTER suspension_duration');
  await addCol('teams', 'suspended_at', 'TIMESTAMP NULL AFTER suspension_notes');
  await addCol('teams', 'suspended_by', 'VARCHAR(100) NULL AFTER suspended_at');

  // Older schemas did not persist friendly match sport; the admin filter and
  // match statistics now use this value directly.
  await addCol('matches', 'sport_type', "ENUM('CRICKET','FOOTBALL','FUTSAL','BADMINTON','BASKETBALL','VOLLEYBALL') NULL AFTER tournament_id");

  // Expand the shared sport enum to match the API types. Existing enum values
  // are retained, so this only allows the additional sports.
  const sportsEnum = "ENUM('CRICKET','FOOTBALL','FUTSAL','BADMINTON','BASKETBALL','VOLLEYBALL')";
  for (const table of ['user_sports_interests', 'teams', 'venue_facilities', 'team_challenges', 'tournaments']) {
    await conn.query(`ALTER TABLE \`${table}\` MODIFY COLUMN sport_type ${sportsEnum} NOT NULL`);
  }
  await conn.query(`ALTER TABLE matches MODIFY COLUMN sport_type ${sportsEnum} NULL`);

  // tournament_brackets columns
  await addCol('tournament_brackets', 'round_name', 'VARCHAR(50) NULL AFTER round_number');
  await addCol('tournament_brackets', 'team1_id', 'BIGINT NULL AFTER match_sequence_in_round');
  await addCol('tournament_brackets', 'team2_id', 'BIGINT NULL AFTER team1_id');
  await addCol('tournament_brackets', 'winner_id', 'BIGINT NULL AFTER team2_id');

  // Extra tables
  const extraQueries = [
    `CREATE TABLE IF NOT EXISTS tournament_reports (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      report_number VARCHAR(50) NOT NULL UNIQUE,
      tournament_id BIGINT NOT NULL,
      reporter_id BIGINT NOT NULL,
      reason ENUM('RULES_VIOLATION', 'ORGANIZER_MISCONDUCT', 'SCHEDULE_FRAUD', 'PRIZE_DISPUTE', 'INAPPROPRIATE_CONTENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
      details TEXT NOT NULL,
      severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
      status ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
      handled_by_admin_id BIGINT NULL,
      resolution_notes TEXT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS team_reports (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      report_number VARCHAR(50) NOT NULL UNIQUE,
      team_id BIGINT NOT NULL,
      reporter_id BIGINT NOT NULL,
      reason ENUM('MISLEADING_INFORMATION', 'ROSTER_ELIGIBILITY_DISPUTE', 'UNSPORTSMANLIKE_CONDUCT', 'INACTIVE_FORFEIT', 'HARASSMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
      details TEXT NOT NULL,
      severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
      status ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
      handled_by_admin_id BIGINT NULL,
      resolution_notes TEXT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS communities (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      sport VARCHAR(80) NOT NULL,
      location VARCHAR(100) NULL,
      description TEXT NOT NULL,
      created_by_id VARCHAR(36) NOT NULL,
      member_count INT NOT NULL DEFAULT 1,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS community_posts (
      id VARCHAR(36) PRIMARY KEY,
      author_id VARCHAR(36) NOT NULL,
      community_id VARCHAR(36) NULL,
      sport VARCHAR(80) NULL,
      headline VARCHAR(120) NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'visible',
      likes_count INT NOT NULL DEFAULT 0,
      comments_count INT NOT NULL DEFAULT 0,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS community_comments (
      id VARCHAR(36) PRIMARY KEY,
      post_id VARCHAR(36) NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS community_likes (
      id VARCHAR(36) PRIMARY KEY,
      post_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      UNIQUE KEY uq_community_likes (post_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS community_memberships (
      id VARCHAR(36) PRIMARY KEY,
      community_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'member',
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      UNIQUE KEY uq_community_memberships (community_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(36) PRIMARY KEY,
      reporter_id VARCHAR(36) NOT NULL,
      target_type VARCHAR(20) NOT NULL,
      target_id VARCHAR(36) NOT NULL,
      reason VARCHAR(500) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      moderator_id VARCHAR(36) NULL,
      moderator_note TEXT NULL,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const q of extraQueries) {
    await conn.query(q);
  }
  await addCol('community_posts', 'headline', "VARCHAR(120) NOT NULL DEFAULT '' AFTER sport");

  const [tables] = await conn.query('SHOW TABLES;');
  console.log('--- RAILWAY SCHEMA INITIALIZATION COMPLETE ---');
  console.log(`Total tables in ${config.database}: ${tables.length}`);
  console.log(tables.map(r => Object.values(r)[0]));

  await conn.end();
}

initRailway().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

