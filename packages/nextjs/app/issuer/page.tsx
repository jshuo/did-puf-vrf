"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import * as didJWT from "did-jwt";
import { Resolver } from "did-resolver";
import { EthrDID } from "ethr-did";
import { getResolver } from "ethr-did-resolver";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type unsignedJWT = {
  payload: didJWT.JWTPayload;
  options?: {
    issuer: string; // Removed signer in order to be able to prepare the message
  };
  header?: {
    alg: string;
  };
};

export default function IssuerPage() {
  const [subjectAddress, setSubjectAddress] = useState("");
  const [audienceAddress, setAudienceAddress] = useState("");
  const [privateClaim, setPrivateClaim] = useState("");
  const [subjectDID, setSubjectDID] = useState("");
  const [audienceDID, setAudienceDID] = useState("");
  const [issuerDID, setIssuerDID] = useState("");
  const [issuerDid, setIssuerDid] = useState<EthrDID>();
  const [audienceDid, setAudienceDid] = useState<EthrDID>();
  const [subjectDid, setSubjectDid] = useState<EthrDID>();
  const [delegateSigner, setDelegateSigner] = useState("");
  const [delegateSignerIdentifier, setDelegateSignerIdentifier] = useState("");
  const [signedJWT, setSignedJWT] = useState<string | undefined>("");
  const [JWTMessage, setJWTMessage] = useState<unsignedJWT | null>(null);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0x48a9054a18c82b126Fae729a493757209E9182b8"; // agence
  const { targetNetwork } = useTargetNetwork();
  const providerConfig = {
    networks: [
      {
        name: "development",
        rpcUrl: "http://localhost:7545",
        chainId: 31337,
        provider,
        registry: AgenceRegistryAddress,
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
  let issuerAddress: string, chainNameOrId: number;

  const processDid = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }
    const subjectAddr = subjectAddress || "0xDBB3d90156fC23c28C709eB68af8403836951AF8";
    const audienceAddr = audienceAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const subjectDid = new EthrDID({ identifier: subjectAddr, provider, chainNameOrId });
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });
    let registryAddress;
    if (targetNetwork.id == 80002) {
      registryAddress = PolyAmoyRegistryAddress;
    } else if (targetNetwork.id == 887) {
      registryAddress = AgenceRegistryAddress;
    } else if (targetNetwork.id == 31337) {
      registryAddress = hardHatRegistryAddress;
    }
    const issuerDid = new EthrDID({
      identifier: issuerAddress,
      provider,
      chainNameOrId,
      registry: registryAddress,
      txSigner: signer,
      alg: "ES256K",
    });

    setSubjectDID(subjectDid.did);
    setAudienceDID(audienceDid.did);
    setIssuerDID(issuerDid.did);
    setIssuerDid(issuerDid);
    setSubjectDid(subjectDid);
    setAudienceDid(audienceDid);
  };

  const prepareJWT = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }

    const buildJWT = {
      payload: {
        iss: issuerDid?.did,
        sub: subjectDid?.did,
        aud: audienceDid?.did,
        privateClaim: privateClaim || "DEFAULT_PRIVATE_CLAIM",
      },
    };

    setJWTMessage(buildJWT);
  };

  const createDelegate = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }

    const { kp } = (await issuerDid?.createSigningDelegate()) || { kp: undefined };
    if (kp !== undefined) {
      // Now you can use kp safely
      setDelegateSigner(kp.address);
      setDelegateSignerIdentifier(kp.identifier);
    }
  };

  const signJWT = async () => {
    if (!JWTMessage) return;

    const signedJWT: string | undefined = await issuerDid?.signJWT(JWTMessage.payload);
    setSignedJWT(signedJWT);

    if (issuerDid != undefined) {
      const issuerDoc = await didResolver.resolve(issuerDid.did);
      console.debug(issuerDoc);
    }

    if (signedJWT != undefined) {
      const JWTVerified = await audienceDid?.verifyJWT(signedJWT, didResolver);
      console.log(`Verify JWT:`);
      console.log(JWTVerified);
    }
  };

  return (
    <div>
      <Head>
        <title>DID Issuers Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Issuer Page (Department of Defense or OEMs) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Issuer Account:</b> <p></p> <Account />
              </h2>
              <p></p>
              <hr />
              <ol>
                <li>1. Create a NeoPUF USB Dongle signing delegate for the connected DID Issuer Account</li>
                <li>
                  2. Bind DID Issuer EVM address (derivative of SECP256K1) with Signer SECP256R1 (or P-256) Public key
                </li>
                <li>3. Register the binding to ERC1056 smart contract</li>
              </ol>
              <h1>JWT Handling with DID</h1>
              <section>
                <h2>Configure subject and audience DIDs</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    processDid();
                  }}
                >
                  <label>
                    Subject Address:
                    <input type="text" value={subjectAddress} onChange={e => setSubjectAddress(e.target.value)} />
                  </label>
                  <label>
                    Audience Address:
                    <input type="text" value={audienceAddress} onChange={e => setAudienceAddress(e.target.value)} />
                  </label>
                  <br />
                  <button
                    type="submit"
                    style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                  >
                    Configure Addresses
                  </button>
                </form>
                <span id="subjectDID">{subjectDID}</span>
                <br />
                <span id="audienceDID">{audienceDID}</span>
                <br />
              </section>
              <section>
                <h2>Prepare JWT Token for Signing</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    prepareJWT();
                  }}
                >
                  <label>
                    Private Claim:
                    <input
                      type="text"
                      value={privateClaim}
                      placeholder="Enter default claim text..."
                      onChange={e => setPrivateClaim(e.target.value)}
                      style={{
                        width: "500px", // Adjust width as needed
                        height: "80px", // Adjust width as needed
                        padding: "8px", // Adjust padding for uniformity with the button
                        marginRight: "10px", // Optional: Provide spacing between input and button
                      }}
                    />
                  </label>
                  <br />
                  <button
                    type="submit"
                    style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                  >
                    Prepare JWT
                  </button>
                </form>
                <span id="issuerDID">{issuerDID}</span>
              </section>
              <section>
                <h2>Create Signing Delegate</h2>
                <button
                  onClick={createDelegate}
                  style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                >
                  Create Delegate
                </button>
                <br />
                <span
                  id="delegateSigner"
                  style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                >
                  delegate address: {delegateSigner}
                </span>
                <br />
                <span
                  id="delegateSignerIdentifier"
                  style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                >
                  {" "}
                  delegate public key: {delegateSignerIdentifier}
                </span>
                <br />
              </section>
              <section>
                <h2>Sign JWT Token</h2>
                <button
                  onClick={signJWT}
                  style={{ backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
                >
                  Sign JWT
                </button>
                <span id="signedJWT">{signedJWT}</span>
              </section>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-diagram.png" alt="Example Image" width={800} height={600} />
        <Image src="/puf-did-ai-board.png" alt="Example Image" width={800} height={600} />
      </div>
    </div>
  );
}
