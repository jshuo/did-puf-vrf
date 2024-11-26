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

const getExpectedChallenge = async () => {
  // Ideally, you would fetch the challenge stored at the time of registration initiation.
  // This is just a mock, replace with your actual logic.
  return "your-expected-challenge";
};

export async function POST(req) {
  if (req.method === "POST") {
    try {
        const { clientResponse } = await req.json();
        console.log("clientResponse:", clientResponse);

        // Retrieve the expected challenge (for comparison)
        const expectedChallenge = await getExpectedChallenge();

        // // Decode clientDataJSON and extract the challenge
        // const clientData = JSON.parse(Buffer.from(clientResponse.clientDataJSON, 'base64').toString());
        // if (clientData.challenge !== expectedChallenge) {
        //     // return res.status(400).json({ error: "Invalid challenge" });
        // }

        // Now verify the attestation object (the credential object)
        const attestationObject = Buffer.from(clientResponse.attestationObject, 'base64');
        const clientDataJSON = Buffer.from(clientResponse.clientDataJSON, 'base64');

        // Perform the FIDO2/WebAuthn verification
        const attestation = await f2l.attestationResult(
            {
                attestationObject,
                clientDataJSON
            }
        );

        // If verification is successful, you now have the public key and other data
        // Store the credential information (e.g., the public key) in your database for future authentication
        const { credentialPublicKey, credentialID, fmt } = attestation;
        console.log("credentialPublicKey:", credentialPublicKey);
        // You can now store the credential details for later authentication
        // For example, store the public key in your database
        // const publicKey = credentialPublicKey.toString('base64'); // store as Base64
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
