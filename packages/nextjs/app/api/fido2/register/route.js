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
  // debugger; // Add this line for server debugging and set breakpoints
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

      const attestationExpectations = {
        challenge: formattedChallenge,
        origin: "http://localhost:3000",
        factor: "either"
      };

      // Perform the FIDO2/WebAuthn verification
      const attestation = await f2l.attestationResult(clientResponse, attestationExpectations);

      // Extract necessary data from authnrData
      const credentialId = (attestation.authnrData.get('credId'));
      const publicKeyPem = attestation.authnrData.get('credentialPublicKeyPem');
      const signCount = attestation.authnrData.get('counter');
      const transports = attestation.authnrData.get('transports') ? attestation.authnrData.get('transports').join(',') : null;

      // Store the credential details in the database
      const connection = await pool.getConnection();
      try {
        // Ensure the user exists in the users table
        let [rows] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
        let userId;
        if (rows.length === 0) {
          // Generate secp256k1 keypair
          const privateKey = crypto.randomBytes(32);
          const publicKey = privateToPublic(privateKey);
          const address = privateToAddress(privateKey).toString('hex');

          // Insert the user if not exists
          const result = await connection.execute(
            'INSERT INTO users (username, display_name, private_key, ethereum_address) VALUES (?, ?, ?, ?)',
            [username, username, privateKey.toString('hex'), `0x${address}`]
          );
          userId = result[0].insertId;
        } else {
          userId = rows[0].id;
        }

        // Insert the credential
        await connection.execute(
          'INSERT INTO credentials (user_id, credential_id, public_key, sign_count, transports) VALUES (?, ?, ?, ?, ?)',
          [userId, credentialId, publicKeyPem, signCount, transports]
        );
      } finally {
        connection.release();
      }

      if (attestation.audit.validExpectations && attestation.audit.complete) {
        // Successfully registered
        console.log('Successfully registered:', attestation.authnrData.get('credId'));
        return new Response(JSON.stringify({ success: true, credentialId: attestation.authnrData.get('credId') }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // If validation fails
      return new Response(JSON.stringify({ success: false, error: 'Invalid attestation' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Registration Error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
