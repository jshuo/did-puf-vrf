"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import { Resolver } from "did-resolver";
import { EthrDID } from "ethr-did";
import { getResolver } from "ethr-did-resolver";
import { useAccount, useBalance } from "wagmi";

export default function VerifierPage() {
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const BesuRegistryAddress = "0xF4a9DDc96DB10650445B03e66117baAdC4c88E66"; // besu
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: connectedAddress } = useAccount();
  const audienceAddr = connectedAddress;
  const [signedJWTVerified, setSignedJWTVerified] = useState("");
  const [openaiResult, setOpenaiResult] = useState("");
  const [openaiImage, setOpenaiImage] = useState("");
  const [geminiResult, setGeminiResult] = useState("");
  const [loading, setLoading] = useState(false);


  const [message, setMessage] = useState('');

  const providerConfig = {
    networks: [
      {
        name: "development",
        rpcUrl: "http://127.0.0.1:7545",
        chainId: 31337,
        provider,
        registry: hardHatRegistryAddress,
      },
      {
        name: "agence",
        rpcUrl: "https://takecopter.cloud.agence.network",
        chainId: 887,
        provider,
        registry: AgenceRegistryAddress,
      },
      {
        name: "PolygonAmoy",
        rpcUrl: "https://rpc-amoy.polygon.technology",
        chainId: 80002,
        provider,
        registry: PolyAmoyRegistryAddress,
      },
      {
        name: "Besu",
        rpcUrl: process.env.BESU_RPC,
        chainId: 1981,
        provider,
        registry: BesuRegistryAddress,
      },
    ],
  };
  const ethrDidResolver = getResolver(providerConfig);
  const didResolver = new Resolver(ethrDidResolver);

  const OpenAIAnalyze = async (text) => {
    try {
      const response = await fetch('/api/aiApiServices/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // Extract the summary from the response

    } catch (error) {
      console.error("Error summarizing text:", error);
      throw error; // Handle the error appropriately
    }
  }

  const GeminiAIAnalyze = async (text) => {
    try {
      const response = await fetch('/api/aiApiServices/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message; // Extract the summary from the response

    } catch (error) {
      console.error("Error summarizing text:", error);
      throw error; // Handle the error appropriately
    }
  }

  const processDid = async () => {
    setSignedJWTVerified("");
    setOpenaiResult("");
    setGeminiResult("");
    setOpenaiImage("")
    setLoading(true); // Set loading state to true
    const signedJWT = localStorage.getItem("jwt");
    const chainNameOrId = await signer.getChainId();
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });
    let JWTVerified

    try {
      JWTVerified = await audienceDid?.verifyJWT(signedJWT, didResolver);
      console.log(`Verify JWT:`);
      console.log(JWTVerified);
    } catch (error) {
      console.error('Error verifying JWT:', error);
      setSignedJWTVerified(error.message);
      setLoading(false); // Set loading state to false after processing
    }

    if (JWTVerified != undefined) {
      setSignedJWTVerified(JSON.stringify(JWTVerified?.verified));
      const openaiAnalysis = await OpenAIAnalyze(JWTVerified.payload!.verifiableClaim!);
      setOpenaiResult(openaiAnalysis.message);
      setOpenaiImage(openaiAnalysis.image);
      const geminiAnalysis = await GeminiAIAnalyze(JWTVerified.payload!.verifiableClaim!);
      setGeminiResult(geminiAnalysis);
    }
    if (signedJWT) {
      localStorage.removeItem("jwt");
    }
    setLoading(false); // Set loading state to false after processing
  };
  return (
    <div>
      <Head>
        <title>DID Verifier Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Verifier Page (Final Assembly/Resellers/Consumers) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Verifier:</b> <p></p>
              </h2>
              <p></p>
              <hr />
              <ul className="list-disc" style={{ marginLeft: '20px' }}>

                <li> To verify Decentralized Identifiers (DIDs) and
                  JSON Web Tokens (JWTs) using Ethereum-based DID (EthrDID).</li>

                <li> EthrDID only allows designated verifier ethereum account to verify the claim</li>
                <li> This functionality is useful for ensuring the authenticity and integrity of claims in a
                  decentralized identity system</li>
                <li> Users can submit a form to process and verify a <b>verifiable credential</b> fetched from storage or a URL-based VC repository.
                </li>
                <li> <b>OpenAI, Gemini, (or future Taiwan trainded AI model) </b> can be used to replace human visual or rule-based inspection and perform analysis on decoded JWT content</li>
              </ul>
            </span>
          </h2>

          <span className="block text-4xl font-bold">
            <form
              onSubmit={e => {
                e.preventDefault();
                processDid();
              }}
            >
              <button
                type="submit"
                style={{
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  margin: "20px",
                  borderRadius: "4px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onMouseOver={e => {
                  e.target.style.backgroundColor = "#0056b3";
                }}
                onMouseOut={e => {
                  e.target.style.backgroundColor = "#007BFF";
                }}
              >
                Claim Verification
              </button>
            </form>
          </span>

          <hr />
          <span id="signedJWT" className="block text-2xl font-bold" >NeoPUF Chip Fingerprint and Signature Verified: </span>
          {loading ? (
            <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
          ) : (
            <div className="block text-4xl font-bold" >{signedJWTVerified}</div>
          )}
          <br />
          <span className="block text-2xl font-bold">
            OpenAI Inspection Result of DID Verifiable Claim:
          </span>

          {loading ? (
            <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
          ) : (
            <span id="signedJWT" className="block text-2xl">
              {openaiResult}
            </span>
          )}

          <span className="block text-2xl font-bold" style={{ marginTop: "30px" }}>
            Gemini Inspection Result of DID Verifiable Claim:
          </span>
          {loading ? (
            <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
          ) : (
            <span id="signedJWT" className="block text-2xl">
              {geminiResult}
            </span>
          )}

        </div>
      </main>

      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/openai-image.png" alt="Example Image" width={800} height={600} />
        <Image src="/did-puf-result.png" alt="Example Image" width={1600} height={1600} />
        {loading ? (
          <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
        ) : (
          <Image src={openaiImage} alt="OpenAI Dall-E Generative Image" width={800} height={600} />
        )}

      </div>
    </div>
  );
}
