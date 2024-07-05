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

useEffect(() => {
  fetch('/api/services')
    .then(res => {
      if (!res.ok) {
        throw new Error('API request failed');
      }
      return res.json();
    })
    .then(data => setMessage(data.message))
    .catch(error => {
      console.error('Error fetching data:', error);
      setMessage('Error: Unable to fetch data from the server'); 
    });
}, []);


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
      // setSignedVC(JSON.stringify(JWTVerified.payload!.veriableClaim!));
      setSignedVC(JSON.stringify(JWTVerified.payload!));
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
          <br />
          <h2 className="block text-2xl">
            The purpose of the VerifierPage in the Next.js application is to verify Decentralized Identifiers (DIDs) and
            JSON Web Tokens (JWTs) using Ethereum-based DID (EthrDID). It allows users to submit a form to process and
            verify a signed JWT retrieved from local storage, displaying the verification results and any associated
            verifiable claims. This functionality is useful for ensuring the authenticity and integrity of claims in a
            decentralized identity system
          </h2>

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
          <span id="signedJWT">Signature Verified: {signedJWTVerified}</span>
          <br />
          <span id="signedJWT">
            DID Verifiable Claim:
            {signedVC}
          </span>
        </div>
      </main>
      <section></section>
      <div>{message}</div>
    </div>
  );
}
