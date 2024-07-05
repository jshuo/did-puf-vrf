"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
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
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: connectedAddress } = useAccount();
  const audienceAddr = connectedAddress;
  const [signedJWTVerified, setSignedJWTVerified] = useState("");
  const [signedVC, setSignedVC] = useState("");

  const [message, setMessage] = useState('');

  const providerConfig = {
    networks: [
      {
        name: "development",
        rpcUrl: "http://localhost:7545",
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
    ],
  };
  const ethrDidResolver = getResolver(providerConfig);
  const didResolver = new Resolver(ethrDidResolver);

  const summarizeText = async (text) => {
    try {
      const response = await fetch('/api/services', {
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
    const signedJWT = localStorage.getItem("jwt");
    const chainNameOrId = await signer.getChainId();
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });
    const JWTVerified = await audienceDid?.verifyJWT(signedJWT, didResolver);
    console.log(`Verify JWT:`);
    console.log(JWTVerified);
    if (JWTVerified != undefined) {
      setSignedJWTVerified(JSON.stringify(JWTVerified?.verified));
      const summary = await summarizeText(JWTVerified.payload!.veriableClaim!);
      setSignedVC(summary);
    }
    if (signedJWT) {
      localStorage.removeItem("jwt");
    }
  };
  return (
    <div>
      <Head>
        <title>DID Verifier Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Verifier Page (Manufacturers / Agents) App</span>
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
                <li>
                  <li> EthrDID only allows designated verifier ethereum account to verify the claim</li>
                  It allows users to submit a form to process and
                  verify a signed JWT retrieved from local storage, displaying the verification results and any associated
                  verifiable claims.
                </li>
                <li> This functionality is useful for ensuring the authenticity and integrity of claims in a
                  decentralized identity system</li>
                <li> Use of OpenAI to perform decoded JWT data</li>
              </ul>
            </span>
          </h2>

          <br />


          <h1 className="text-center">
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
          </h1>
          <hr />
          <span id="signedJWT" className="block text-2xl" >Signature Verified: {signedJWTVerified}</span>
          <br />
          <span className="block text-4xl font-bold">
            OpenAI Summary of DID Verifiable Claim:
          </span>
          <span id="signedJWT" className="block text-2xl">

            {signedVC}
          </span>
        </div>
      </main>


    </div>
  );
}
