import { Fido2Lib, coerceToBase64Url } from "fido2-lib";

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
  // register option
  // debugger; // Add this line for server debugging and set breakpoints
  try {
    const { username } = await req.json();
    const registrationOptions = await f2l.attestationOptions();

    // Add user-specific information
    registrationOptions.user = {
      id: Buffer.from(username), // Use the provided username
      name: username,
      displayName: username,
    };


    // Store challenge in session (pseudo-code: replace with your session management)
    const headers = new Headers();
    registrationOptions.challenge = coerceToBase64Url(registrationOptions.challenge, "challenge");
    headers.append("Set-Cookie", `challenge=${JSON.stringify(registrationOptions.challenge)}; HttpOnly; Path=/;`);

    return new Response(JSON.stringify(registrationOptions), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to generate registration options" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
