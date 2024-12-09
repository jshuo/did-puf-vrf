"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

export default function FidoPage() {
  const [username, setUsername] = useState("");
  const handleRegister = async () => {
    try {
      console.log("Fetching registration options...");

      // Step 1: Fetch registration options from server using POST
      console.log("POST /api/fido2/register-options");
      console.log("Registering user:", username);
      const response = await fetch("/api/fido2/register-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const registrationOptions = await response.json();

      console.log("Original user ID:", registrationOptions.user.id);
      const buffer = Buffer.from(registrationOptions.user.id.data);

      // Step 2: Convert the Buffer to an ArrayBuffer
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);

      // Step 3: Set the ArrayBuffer as the user.id in registrationOptions
      registrationOptions.user.id = arrayBuffer;

      const coerceToArrayBuffer = (base64url: string) => {
        // Add padding if necessary
        const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
        const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + padding;
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      };

      console.log("ArrayBuffer challenge:", coerceToArrayBuffer(registrationOptions.challenge));
      registrationOptions.challenge = coerceToArrayBuffer(registrationOptions.challenge);
      console.log("Creating credentials...");

      // Step 2: Call WebAuthn API
      const credentials = (await navigator.credentials.create({
        publicKey: registrationOptions,
      })) as PublicKeyCredential;

      if (!credentials) throw new Error("Credential creation failed");

      // Convert response to JSON format
      const clientResponse = {
        id: credentials.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credentials.rawId))),
        response: {
          attestationObject: btoa(
            String.fromCharCode(
              ...new Uint8Array((credentials.response as AuthenticatorAttestationResponse).attestationObject),
            ),
          ),
          clientDataJSON: btoa(
            String.fromCharCode(
              ...new Uint8Array((credentials.response as AuthenticatorAttestationResponse).clientDataJSON),
            ),
          ),
        },
        type: credentials.type,
      };

      console.log("Sending response to server...");

      // Step 3: Send the response to the server for verification
      const verifyRes = await fetch("/api/fido2/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientResponse, username }),
      });

      const result = await verifyRes.json();

      if (result.success) {
        console.log("Registration successful!");
      } else {
        console.log("Registration failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      console.log("Error: " + (error as Error).message);
    }
  };
  const handleAuthenticate = async () => {
    try {
      console.log("Fetching authentication options...");

      // Step 1: Fetch authentication options from server
      const res = await fetch("/api/fido2/authentication-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const options = await res.json();

      // Convert challenge and allowCredentials IDs to ArrayBuffer
      options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (options.challenge.length % 4)) % 4)), c => c.charCodeAt(0));
      options.allowCredentials = options.allowCredentials.map((cred: PublicKeyCredentialDescriptor) => {
        const id = typeof cred.id === 'string' ? cred.id : Buffer.from(cred.id).toString('base64');
        return {
          id: Uint8Array.from(atob(id.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (id.length % 4)) % 4)), c => c.charCodeAt(0)),
          type: cred.type,
          transports: cred.transports,
        };
      });

      console.log("Getting credentials...");

      // Step 2: Call WebAuthn API to get credentials
      const credentials = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge).buffer, // Convert challenge to ArrayBuffer
          allowCredentials: options.allowCredentials.map((cred: PublicKeyCredentialDescriptor) => ({
            ...cred,
            id: cred.id instanceof ArrayBuffer ? cred.id : new Uint8Array(cred.id).buffer, // Ensure id is an ArrayBuffer
          })),
        },
      })) as PublicKeyCredential;
    
      console.log('Credentials obtained:', credentials);

      if (!credentials) throw new Error("Credential retrieval failed");

      // Convert response to JSON format
      const clientResponse = {
        id: credentials.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credentials.rawId))),
        response: {
          authenticatorData: btoa(
            String.fromCharCode(
              ...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).authenticatorData),
            ),
          ),
          clientDataJSON: btoa(
            String.fromCharCode(
              ...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).clientDataJSON),
            ),
          ),
          signature: btoa(
            String.fromCharCode(...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).signature)),
          ),
          userHandle: (credentials.response as AuthenticatorAssertionResponse).userHandle
            ? btoa(
                String.fromCharCode(
                  ...new Uint8Array((credentials.response as AuthenticatorAssertionResponse).userHandle!),
                ),
              )
            : null,
        },
        type: credentials.type,
      };

      console.log("Sending response to server...");

      // Step 3: Send response to server for verification
      const verifyRes = await fetch("/api/fido2/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientResponse, username }), // Add username to the request body
      });

      const result = await verifyRes.json();

      if (result.success) {
        console.log("Authentication successful!");
      } else {
        console.log("Authentication failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      console.log("Error: " + (error as Error).message);
    }
  };

  return (
    <div style={styles.container as React.CSSProperties}>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={styles.input} />
      <div style={styles.buttonContainer}>
        <button onClick={handleRegister} style={styles.primaryButton}>
          Register
        </button>
        <button onClick={handleAuthenticate} style={styles.primaryButton}>
          Authenticate
        </button>
      </div>
      <button style={styles.secondaryButton}>Advanced Settings</button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(to top, #a8edea, #fed6e3)", // Adjusted gradient
    fontFamily: "Arial, sans-serif",
  },
  input: {
    width: "300px",
    height: "40px",
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  buttonContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  primaryButton: {
    width: "140px",
    height: "40px",
    backgroundColor: "#3b5998", // Facebook-style blue
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "300px",
    height: "40px",
    backgroundColor: "#777", // Grey color
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
