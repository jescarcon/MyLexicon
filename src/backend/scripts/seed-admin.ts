import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

async function seedAdmin() {
  // Initialize PostgreSQL client using environment variables
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  // Get admin password from environment or use default
  const passwordPlain = process.env.ADMIN_PASSWORD || 'Admin123!';
  const saltRounds = Number(process.env.BCRYPT_SALT) || 10;
  
  // Hash the admin password
  const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

  // SQL query to insert the admin user
  const query = `
    INSERT INTO public."user" (
      name, email, password, role, "verified", "createdAt", "updatedAt"
    ) VALUES (
      'Super Admin',
      'admin@example.com',
      $1,
      'ADMIN',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO NOTHING; -- Avoid duplicating if the email already exists
  `;

  try {
    // Execute the query with the hashed password
    await client.query(query, [passwordHash]);
    console.log(`Admin user created successfully with email: admin@example.com and password: ${passwordPlain}`);
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await client.end();
  }
}

// Run the seed script
seedAdmin().catch(err => {
  console.error('Error running seed script:', err);
});