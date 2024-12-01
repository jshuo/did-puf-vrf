"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";


export function Register() {
    const [status, setStatus] = useState("");

    const handleRegister = async () => {
        try {
            setStatus("Fetching registration options...");

            // Step 1: Fetch registration options from server
            console.log("GET /api/fido2/register-options");
            const response = await fetch("/api/fido2/register-options");
            const registrationOptions = await response.json();

            console.log("Original user ID:", registrationOptions.user.id);
            const buffer = Buffer.from(registrationOptions.user.id.data);

            // Step 2: Convert the Buffer to an ArrayBuffer
            const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);

            // Step 3: Set the ArrayBuffer as the user.id in registrationOptions
            registrationOptions.user.id = arrayBuffer;

            const coerceToArrayBuffer = (base64url: string) => {
                const binaryString = atob(base64url.replace(/-/g, "+").replace(/_/g, "/"));
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes.buffer;
            };

            console.log("ArrayBuffer challenge:", coerceToArrayBuffer(registrationOptions.challenge));
            registrationOptions.challenge = coerceToArrayBuffer(registrationOptions.challenge);
            setStatus("Creating credentials...");


            // Step 2: Call WebAuthn API
            const credentials = await navigator.credentials.create({ publicKey: registrationOptions }) as PublicKeyCredential;

            if (!credentials) throw new Error("Credential creation failed");

            // Convert response to JSON format
            const clientResponse = {
                id: credentials.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credentials.rawId))),
                response: {
                    attestationObject: btoa(
                        String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAttestationResponse).attestationObject))
                    ),
                    clientDataJSON: btoa(
                        String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAttestationResponse).clientDataJSON))
                    ),
                },
                type: credentials.type,
            };

            setStatus("Sending response to server...");

            // Step 3: Send the response to the server for verification
            const verifyRes = await fetch("/api/fido2/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientResponse }),
            });

            const result = await verifyRes.json();

            if (result.success) {
                setStatus("Registration successful!");
            } else {
                setStatus("Registration failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            setStatus("Error: " + (error as Error).message);
        }
    };

    return (
        <div>
            <h1>FIDO2 Registration</h1>
            <button onClick={handleRegister}>Register with FIDO HID</button>
            <p>Status: {status}</p>
        </div>
    );
}

export function Login() {
    const [status, setStatus] = useState("");

    const handleLogin = async () => {
        try {
            setStatus("Fetching authentication options...");

            // Step 1: Fetch authentication options from server
            const res = await fetch("/api/fido2/auth-options");
            const options = await res.json();

            // Convert challenge and allowCredentials IDs to ArrayBuffer
            options.challenge = Uint8Array.from(atob(options.challenge), (c) => c.charCodeAt(0));
            options.allowCredentials = options.allowCredentials.map((cred: PublicKeyCredentialDescriptor) => ({
                id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
                type: cred.type,
                transports: cred.transports,
            }));

            setStatus("Getting credentials...");

            // Step 2: Call WebAuthn API to get credentials
            const credentials = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;

            if (!credentials) throw new Error("Credential retrieval failed");

            // Convert response to JSON format
            const clientResponse = {
                id: credentials.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credentials.rawId))),
                response: {
                    authenticatorData: btoa(
                        String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).authenticatorData))
                    ),
                    clientDataJSON: btoa(
                        String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).clientDataJSON))
                    ),
                    signature: btoa(
                        String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).signature))
                    ),
                    userHandle: (credentials.response as AuthenticatorAssertionResponse).userHandle
                        ? btoa(String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).userHandle!)))
                        : null,
                },
                type: credentials.type,
            };

            setStatus("Sending response to server...");

            // Step 3: Send response to server for verification
            const verifyRes = await fetch("/api/fido2/authenticate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientResponse }),
            });

            const result = await verifyRes.json();

            if (result.success) {
                setStatus("Authentication successful!");
            } else {
                setStatus("Authentication failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            setStatus("Error: " + (error as Error).message);
        }
    };

    return (
        <div>
            <h1>FIDO2 Authentication</h1>
            <button onClick={handleLogin}>Login with FIDO HID</button>
            <p>Status: {status}</p>
        </div>
    );
}

export default function FidoPage() {
    return (
        <div>
            <Head>
                <title>FIDO Page</title>
            </Head>
            <main>
                <div className="px-5">
                    <Register />
                    <Login />
                </div>
                <hr />

                <br />
            </main>
        </div>
    );
}
