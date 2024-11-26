import { Fido2Lib, coerceToArrayBuffer, coerceToBase64Url } from "fido2-lib";

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

      // If verification is successful, you now have the public key and other data
      // Store the credential information (e.g., the public key) in your database for future authentication

      const publicKeyPem = attestation.authnrData.get('credentialPublicKeyPem');
      console.log(publicKeyPem); // Logs the PEM formatted public key
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
