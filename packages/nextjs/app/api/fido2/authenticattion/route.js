// implement the route for the fido2 authentication

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
            const userId = 4; // Replace with the actual user ID 
            const publicKey = arrayBufferToBase64(attestation.authnrData.credentialPublicKey);
            const counter = attestation.authnrData.counter;
            // Store the public key and counter in your database 
            const connection = await pool.getConnection();
            await connection.query(
                `INSERT INTO credentials (user_id, public_key, counter) VALUES (?, ?, ?)`,
                [userId, publicKey, counter]
            );
            connection.release();
            return {
                status: 200,
                body: {
                    message: "Successfully authenticated"
                }
            };
        } catch (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            };
        }
    }
}