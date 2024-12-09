import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { cookies } from "next/headers";

// Function to get user credentials from MySQL
async function getUserCredentials(userId) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fido2_db'
  });

  const [rows] = await connection.execute('SELECT credential_id FROM credentials WHERE user_id = ?', [userId]);
  await connection.end();
  return rows.map(row => ({
    id: Buffer.from(row.credential_id, 'hex'),
    type: 'public-key'
  }));
}

async function generateAuthOptions(userId) {
  const userCredentials = await getUserCredentials(userId);

  const options = {
    challenge: crypto.randomBytes(32).toString('base64url'), // Use base64url for compatibility
    timeout: 60000,
    userVerification: 'required',
    rpId: "localhost",
    rpName: 'ACME',
    rpIcon: 'https://example.com/logo.png',
    ...(userCredentials.length > 0 && { allowCredentials: userCredentials }),
  };

  return options;
}

export async function POST(req) {
  debugger; // Add this line for server debugging and set breakpoints
  try {
    const { username } = await req.json();
    
    // Fetch user ID from the database using the username
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fido2_db'
    });
    const [rows] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    await connection.end();

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = rows[0].id;
    const authOptions = await generateAuthOptions(userId);

    // Store challenge in session (pseudo-code: replace with your session management)
    const headers = new Headers();
    headers.append("Set-Cookie", `challenge=${JSON.stringify(authOptions.challenge)}; HttpOnly; Path=/;`);

    return new Response(JSON.stringify(authOptions), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to generate authentication options" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
    },
  });
}