import { Fido2Lib, coerceToArrayBuffer } from "fido2-lib";
import mysql from 'mysql2/promise';
import { cookies } from "next/headers";

const f2l = new Fido2Lib({
  timeout: 60000,
  rpId: "localhost",
  rpName: "ACME",
  rpIcon: "https://example.com/logo.png",
  challengeSize: 128,
  cryptoParams: [-7, -257],
});

export async function POST(req) {
  debugger; // Add this line for server debugging and set breakpoints
  try {
    const { clientResponse, username } = await req.json(); // Add username to the request body
    const cookieStore = cookies();
    const challenge = cookieStore.get("challenge")?.value;

    // Ensure challenge is properly formatted
    const formattedChallenge = challenge?.replace(/^"|"$/g, ""); // Remove extra quotes

    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fido2_db'
    });

    // Convert id and rawId to ArrayBuffer
    clientResponse.id = coerceToArrayBuffer(clientResponse.id, "id");
    clientResponse.rawId = coerceToArrayBuffer(clientResponse.rawId, "rawId");

    const [rows] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = rows[0].id;

    const [credentialRows] = await connection.execute('SELECT credential_id FROM credentials WHERE user_id = ?', [userId]);
    if (credentialRows.length === 0) {
      return new Response(JSON.stringify({ error: "No credentials found for user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const credentialId = credentialRows[0].credential_id;

    const assertionExpectations = {
      challenge: formattedChallenge,
      origin: "http://localhost:3000",
      factor: "either",
      publicKey: {
        id: coerceToArrayBuffer(credentialId, "credentialId"),
        type: "public-key",
      },
    };

    // Perform the FIDO2/WebAuthn verification
    const assertion = await f2l.assertionResult(clientResponse, assertionExpectations);

    console.log(assertion.authnrData);

    // Extract necessary data from authnrData
    const publicKey = arrayBufferToBase64(assertion.authnrData.get('credentialPublicKey'));
    const counter = assertion.authnrData.get('counter');

    // Store the public key and counter in your database
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO credentials (user_id, public_key, counter) VALUES (?, ?, ?)`,
      [userId, publicKey, counter]
    );
    connection.release();

    return new Response(JSON.stringify({ message: "Successfully authenticated", success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error during authentication verification:", error);
    return new Response(JSON.stringify({ message: error.message, success: false }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
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