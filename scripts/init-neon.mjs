import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_4At6XcYjmKda@ep-tiny-bar-aen8qesj-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function generateSchema() {
    console.log('Connecting to Neon...');
    const sql = neon(DATABASE_URL);

    console.log('Creating leaderboard table...');
    await sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      name VARCHAR(8) NOT NULL,
      score INT NOT NULL,
      level INT NOT NULL,
      wave INT NOT NULL,
      date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

    console.log('Database schema created successfully.');
    process.exit(0);
}

generateSchema().catch((err) => {
    console.error('Error creating database schema:', err);
    process.exit(1);
});
