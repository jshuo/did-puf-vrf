import { Fido2Lib, coerceToArrayBuffer, coerceToBase64Url } from "fido2-lib";

const f2l = new Fido2Lib({
    timeout: 60000,
    rpId: "localhost",
    rpName: "ACME",
    rpIcon: "https://example.com/logo.png",
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7, -257],
    authenticatorAttachment: "platform",
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: "required"
});

export async function GET(req) {
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
        headers.append("Set-Cookie", `challenge=${registrationOptions.challenge}; HttpOnly; Path=/;`);
        registrationOptions.challenge =  (coerceToBase64Url(registrationOptions.challenge, "challenge"));
        console.log("Original challenge:", coerceToArrayBuffer(registrationOptions.challenge, "challenge"));
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
