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
import {jetsonData, teslaBatt, clife} from "./claimData"

function getRandomClaimData(): string {
  const dataOptions = [jetsonData, teslaBatt, clife];
  const randomIndex = Math.floor(Math.random() * dataOptions.length);
  return JSON.stringify(dataOptions[randomIndex]);
}

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
  const [veriableClaim, setVeriableClaim] = useState(getRandomClaimData());
  const [subjectDID, setSubjectDID] = useState("");
  const [audienceDID, setAudienceDID] = useState("");
  const [issuerDID, setIssuerDID] = useState("");
  const [issuerDid, setIssuerDid] = useState<EthrDID>();
  const [audienceDid, setAudienceDid] = useState<EthrDID>();
  const [subjectDid, setSubjectDid] = useState<EthrDID>();
  const [signedJWT, setSignedJWT] = useState<string | undefined>("");
  const [JWTMessage, setJWTMessage] = useState<unsignedJWT | null>(null);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const { targetNetwork } = useTargetNetwork();



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
        veriableClaim: veriableClaim,
      },
    };
    setJWTMessage(buildJWT);
  };


  const signJWT = async () => {
    if (!JWTMessage) return;
    //  should check if delegate signer is one of the issuer delegates 
    // the following operation is expensive;  should be cached 
    // comment it out for now for response time 
    // if (issuerDid != undefined) {
    //   const issuerDoc = await didResolver.resolve(issuerDid.did);
    //   console.log(issuerDoc);
    // }
    const signedJWT: string | undefined = await issuerDid?.signJWT(JWTMessage.payload);
    if (signedJWT != undefined) localStorage.setItem('jwt', signedJWT);
    setSignedJWT(signedJWT);

  };

  return (
    <div>
      <Head>
        <title>DID Issuers Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Delegate Signer Page (Manufacturers / Agents) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Signer:</b> <p></p>
              </h2>
              <p></p>
              <hr />
              <ul className="list-disc" style={{ marginLeft: '20px' }}>
                <li> A delegate signer is an entity authorized to act on behalf of the identity owner (i.e. its DID issuer). <b>Our design modifies ethr-did to utilize a secp256r1 hardware/PUF-based USB dongle on the client side or an HSM on the server side as the delegate signer.</b></li>
                  This authorization is managed by the identity owner  (i.e. its DID issuer) and is recorded on the blockchain.
                <li>  Delegate signers add a layer of security and flexibility. The identity owner (i.e. its DID issuer) does not need to use their private key for every transaction, reducing the risk of key exposure.</li>
              </ul>
              <section>
                <br />
                <h2 className="block text-2xl mb-2 font-bold">Configure subject and audience DIDs</h2>
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
                  <br />
                  <label>
                    Audience Address:
                    <input type="text" value={audienceAddress} onChange={e => setAudienceAddress(e.target.value)} />
                  </label>
                  <br />
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
                    }}                  >
                    Configure Addresses
                  </button>
                </form>
                <br />
                <span id="subjectDID">Subject Address: {subjectDID}</span>
                <br />
                <span id="audienceDID">Verifier Address: {audienceDID}</span>
                <br />
                <span id="issuerDID">Issuer Address: {issuerDID}</span>
                <br />
              </section>
              <section>
                <h2 className="block text-2xl mb-2 font-bold"> Enter Raw Claim, and then prepare JWT Token for Signing</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    prepareJWT();
                  }}
                >
                  <label>
                    <textarea
                      value={veriableClaim}
                      placeholder={(veriableClaim)}
                      onChange={e => setVeriableClaim(veriableClaim)}
                      style={{
                        width: "1000px", // Adjust width as needed
                        height: "500px", // Adjust width as needed
                        padding: "8px", // Adjust padding for uniformity with the button
                        marginRight: "10px", // Optional: Provide spacing between input and button
                      }}
                    />
                  </label>
                  <br />
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
                    }}                   >
                    Prepare JWT
                  </button>
                </form>

              </section>
              <section>
                <h2></h2>
                <button
                  onClick={signJWT}
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
                  }}                 >
                  Sign JWT
                </button>
                <span style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  maxHeight: '1000px',
                  overflow: 'auto',
                  padding: '8px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  marginRight: '10px'
                }}>
                  {signedJWT}
                </span>
                <br />
              </section>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main >
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-diagram.png" alt="Example Image" width={800} height={600} />
        <Image src="/puf-did-ai-board.png" alt="Example Image" width={800} height={600} />
      </div>
    </div >
  );
}
