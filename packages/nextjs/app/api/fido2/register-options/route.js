import { Fido2Lib, coerceToArrayBuffer, coerceToBase64Url } from "fido2-lib";

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

export async function GET(req) {
    debugger; // Add this line
    try {
        const registrationOptions = await f2l.attestationOptions();

        // Add user-specific information
        registrationOptions.user = {
            id: Buffer.from("jeffshuo"), // Replace with actual user ID
            name: "jeffshuo", // Replace with actual username
            displayName: "jeffshuo",
        };

        // Store challenge in session (pseudo-code: replace with your session management)
        // Next.js does not support built-in session handling, so use cookies, JWT, or another method.
        // Example (using cookies):
        const headers = new Headers();
        registrationOptions.challenge =  (coerceToBase64Url(registrationOptions.challenge, "challenge"));
        headers.append("Set-Cookie", `challenge=${JSON.stringify(registrationOptions.challenge)}; HttpOnly; Path=/;`);
        // console.log("Original challenge:", JSON.stringify(registrationOptions.challenge));
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
