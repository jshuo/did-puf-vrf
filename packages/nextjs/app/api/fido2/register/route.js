import { Fido2Lib, coerceToArrayBuffer, coerceToBase64Url } from "fido2-lib";
const mysql = require('mysql2/promise');
import { cookies } from "next/headers";


const f2l = new Fido2Lib({
  timeout: 60000,
  rpId: "localhost",
  rpName: "ACME",
  rpIcon: "https://example.com/logo.png",
  challengeSize: 128,
  attestation: "none",
  cryptoParams: [-7, -257],
});


function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function POST(req) {
  if (req.method === "POST") {
    try {
      const { clientResponse } = await req.json();
      const cookieStore = cookies();
      const challenge = cookieStore.get("challenge")?.value;

      // Ensure challenge is properly formatted
      const formattedChallenge = challenge?.replace(/^"|"$/g, ""); // Remove extra quotes
      // };


      const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fido2_db'
      });

      // Convert id and rawId to ArrayBuffer
      clientResponse.id = coerceToArrayBuffer(clientResponse.id, "id");
      clientResponse.rawId = coerceToArrayBuffer(clientResponse.rawId, "rawId");

      const attestationExpectations = {
        challenge: formattedChallenge,
        origin: "http://localhost:3000",
        factor: "either"
      };

      // Perform the FIDO2/WebAuthn verification
      const attestation = await f2l.attestationResult(clientResponse,
        attestationExpectations
      )

      console.log((attestation.authnrData)); 

      // If verification is successful, you now have the public key and other data
      // Store the credential information (e.g., the public key) in your database for future authentication

    // If verification is successful, you now have the public key and other data

  // Extract necessary data from authnrData
  const userId = 2; // Replace with the actual user ID
  const credentialId = arrayBufferToBase64(attestation.authnrData.get('credId'));
  const publicKeyPem = attestation.authnrData.get('credentialPublicKeyPem');
  const signCount = attestation.authnrData.get('counter');
  const transports = attestation.authnrData.get('transports') ? attestation.authnrData.get('transports').join(',') : null;

  // Store the credential details in the database
  const connection = await pool.getConnection();
  try {
    // Ensure the user exists in the users table
    const [rows] = await connection.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      // Insert the user if not exists
      await connection.execute('INSERT INTO users (id, username, display_name) VALUES (?, ?, ?)', [userId, 'username', 'display_name']);
    }

    // Insert the credential
    await connection.execute(
      'INSERT INTO credentials (user_id, credential_id, public_key, sign_count, transports) VALUES (?, ?, ?, ?, ?)',
      [userId, credentialId, publicKeyPem, signCount, transports]
    );
  } finally {
    connection.release();
  }
      // You can now store the credential details for later authentication
      // For example, store the public key in your database
 
      return new Response(JSON.stringify(attestation), {
        status: 200, // Or an appropriate status code
        headers: {
          "Content-Type": "application/json",
        },
      });


    } catch (error) {
      console.error("Error during registration verification:", error);
    }
  } else {
    // Handle any non-POST requests
    res.status(405).json({ error: "Method not allowed" });
  }
}
