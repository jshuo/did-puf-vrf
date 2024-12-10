import { Fido2Lib, coerceToArrayBuffer, coerceToBase64Url } from "fido2-lib";
import mysql from 'mysql2/promise';
import { cookies } from "next/headers";
import { privateToAddress, privateToPublic } from 'ethereumjs-util';
import crypto from 'crypto';

const f2l = new Fido2Lib({
  timeout: 60000,
  rpId: "localhost",
  rpName: "ACME",
  rpIcon: "https://example.com/logo.png",
  challengeSize: 128,
  attestation: "none",
  cryptoParams: [-7, -257],
  authenticatorUserVerification: "required"
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
  debugger; // Add this line for server debugging and set breakpoints
  if (req.method === "POST") {
    try {
      const { clientResponse, username } = await req.json();
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

      const assertionExpectations = {
        challenge: formattedChallenge,
        origin: "http://localhost:3000",
        factor: "either",
        publicKey: clientResponse.id, // Use the credential ID as the public key
        userHandle: clientResponse.response.userHandle ? coerceToArrayBuffer(clientResponse.response.userHandle, "userHandle") : null,
      };

      // Retrieve the stored public key and sign_count from the database
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT public_key, sign_count FROM credentials WHERE user_id = (SELECT id FROM users WHERE username = ?)', [username]);
      connection.release();

      if (rows.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const storedPublicKey = rows[0].public_key;
      const storedSignCount = rows[0].sign_count;

      // Perform the FIDO2/WebAuthn verification
      const assertion = await f2l.assertionResult(clientResponse, {
        ...assertionExpectations,
        publicKey: storedPublicKey.toString(),
        prevCounter: storedSignCount,
      });

      // console.log(assertion.authnrData);
      console.log(JSON.stringify(assertion));

      // Extract necessary data from authnrData
      const newSignCount = assertion.authnrData.get('counter');

      // Update the sign_count in the database
      const updateConnection = await pool.getConnection();
      await updateConnection.query(
        `UPDATE credentials SET sign_count = ? WHERE user_id = (SELECT id FROM users WHERE username = ?)`,
        [newSignCount, username]
      );
      updateConnection.release();

      return new Response(JSON.stringify({ message: "Successfully authenticated", success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error('Authentication Error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
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