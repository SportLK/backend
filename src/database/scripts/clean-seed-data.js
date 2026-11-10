const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function cleanSeedData() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '44716'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Cleaning seed data from Railway MySQL...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await conn.query('TRUNCATE TABLE match_scores;');
  await conn.query('TRUNCATE TABLE matches;');
  await conn.query('TRUNCATE TABLE tournament_brackets;');
  await conn.query('TRUNCATE TABLE tournament_registrations;');
  await conn.query('TRUNCATE TABLE tournament_reports;');
  await conn.query('TRUNCATE TABLE tournaments;');
  await conn.query('TRUNCATE TABLE team_challenges;');
  await conn.query('TRUNCATE TABLE team_invitations;');
  await conn.query('TRUNCATE TABLE team_members;');
  await conn.query('TRUNCATE TABLE team_reports;');
  await conn.query('TRUNCATE TABLE teams;');
  await conn.query('TRUNCATE TABLE venue_bookings;');
  await conn.query('TRUNCATE TABLE venue_facilities;');
  await conn.query('TRUNCATE TABLE venues;');
  await conn.query('TRUNCATE TABLE post_comments;');
  await conn.query('TRUNCATE TABLE post_likes;');
  await conn.query('TRUNCATE TABLE post_reports;');
  await conn.query('TRUNCATE TABLE posts;');
  await conn.query('TRUNCATE TABLE community_comments;');
  await conn.query('TRUNCATE TABLE community_likes;');
  await conn.query('TRUNCATE TABLE community_memberships;');
  await conn.query('TRUNCATE TABLE community_posts;');
  await conn.query('TRUNCATE TABLE communities;');
  await conn.query('TRUNCATE TABLE notifications;');
  await conn.query('TRUNCATE TABLE role_applications;');
  await conn.query('TRUNCATE TABLE reports;');
  await conn.query('TRUNCATE TABLE payments;');
  await conn.query('TRUNCATE TABLE user_sports_interests;');
  // Delete all users except the admin
  await conn.query("DELETE FROM users WHERE email != 'admin@sportlk.com';");
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

  const [users] = await conn.query('SELECT id, email, full_name, base_role FROM users;');
  console.log('Cleaned database! Remaining users:', users);
  await conn.end();
}

cleanSeedData().catch(console.error);

