"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import * as didJWT from "did-jwt";
import { EthrDID } from "ethr-did";
import { jetsonData, teslaBatt, clife } from "./claimData"

import { Wallet } from "ethers";
import { QRCodeSVG } from "qrcode.react";

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
  const [randomClaimData, setRandomClaimData] = useState(getRandomClaimData());
  const [subjectDID, setSubjectDID] = useState("");
  const [audienceDID, setAudienceDID] = useState("");
  const [issuerDID, setIssuerDID] = useState("");
  const [signedJWT, setSignedJWT] = useState<string | undefined>("");
  const provider = useEthersProvider();
  const rpcSigner = useEthersSigner();


  let issuerAddress: string, chainNameOrId: number;


  const pufHsmRemoteUrl = process.env.NEXT_PUBLIC_PUF_HSM_REMOTE_URL || undefined
  const getPrivateKey = async () => {
    let privateKey = "9823456789012345668901234567870233456789012345678901a3456789012a";
    if (pufHsmRemoteUrl !== undefined) {
      const response = await fetch(`${pufHsmRemoteUrl}pufs_get_privkey_js`)
      if (!response.ok) {
        throw new Error(`getPrivateKey HTTP error! status: ${response.status}`);
      }
      const jsonString: string = await response.text()
      privateKey = JSON.parse(jsonString).actualPrivKey;
    }

    return privateKey;
  }

  const getPufUid = async () => {
    let pufUid = "9823456789012345668901234567870233456789012345678901a3456789012a";
    if (pufHsmRemoteUrl !== undefined) {
      const response = await fetch(`${pufHsmRemoteUrl}pufs_get_uid_js`)
      if (!response.ok) {
        throw new Error(`getPufUid HTTP error! status: ${response.status}`);
      }
      const jsonString: string = await response.text()
      pufUid = JSON.parse(jsonString).uid;
    }

    return pufUid;
  }
  const signJWT = async () => {

    if (rpcSigner) {
      issuerAddress = await rpcSigner.getAddress();
      chainNameOrId = await rpcSigner.getChainId();
    }
    const privateKey = await getPrivateKey();
    // Create wallet instance from private key
    const wallet = new Wallet(privateKey);

    const pufUid = await getPufUid()

    const subjectAddr = subjectAddress || wallet.address;
    const audienceAddr = audienceAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const subjectDid = new EthrDID({ identifier: subjectAddr, provider, chainNameOrId });
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });
    const issuerDid = new EthrDID({ identifier: issuerAddress, chainNameOrId });

    setSubjectDID(subjectDid.did);
    setAudienceDID(audienceDid.did);
    setIssuerDID(issuerDid.did);

    const buildJWT = {
      payload: {
        iss: issuerDid?.did,
        sub: subjectDid?.did,
        aud: audienceDid?.did,
        verifiableClaim: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject: {
            deviceId: `did:neopuf:uid:${pufUid}`,
            claim: randomClaimData  // Assuming verifiableClaim is an object or data structure

          }
        },
      },
    };

    //  should check if delegate signer is one of the issuer delegates 
    // the following operation is expensive;  should be cached 
    // comment it out for now for response time 
    // if (issuerDid != undefined) {
    //   const issuerDoc = await didResolver.resolve(issuerDid.did);
    //   console.log(issuerDoc);
    // }
    const signedJWT: string | undefined = await issuerDid?.signJWT(buildJWT.payload, undefined, pufHsmRemoteUrl);
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
                <h2 className="block text-2xl mb-2 font-bold"> Enter Raw Claim, and then prepare JWT Token for Signing</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    signJWT();
                  }}
                >
                  <label>
                    <div className="flex gap-12 flex-col sm:flex-row">
                      <textarea
                        value={randomClaimData}
                        placeholder="Enter claim data..." // Placeholder text to hint user
                        onChange={e => setRandomClaimData(e.target.value)} // Use e.target.value to update state
                        style={{
                          width: "1000px", // Adjust width as needed
                          height: "500px", // Adjust height as needed
                          padding: "8px", // Adjust padding for uniformity
                          marginRight: "10px", // Optional: Provide spacing between input and button
                        }}
                      />
                      <Image src="/pufsystem-demo.jpg" alt="Example Image" width={550} height={450} />
                    </div>
                  </label>
                  <br />
                  <label>
                    Subject Address:
                    <input type="text" value={subjectAddress} onChange={e => setSubjectAddress(e.target.value)} />
                  </label>
                  <br />
                  <label>
                    Audience/Verifier Address:
                    <input type="text" value={audienceAddress} onChange={e => setAudienceAddress(e.target.value)} />
                  </label>
                  <br />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      marginTop: "20px",
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
                    }}                   > <b>Sign Credential/Claim</b>
                  </button>
                </form>
                <br />
                <span id="audienceDID"><b>Audience/Verifier Address: </b>{audienceDID}</span>
                <br />
                <span id="issuerDID"><b>Issuer Address: </b>{issuerDID}</span>
                <br />
                <span id="subjectDID"><b>Subject Address (generated from PUFse):</b> {subjectDID}</span>
                <QRCodeSVG value={subjectDID} />
                <br />
               <span id="issuerDID"><b>Signed JWT (Verifiable Credential): </b>{signedJWT}</span>
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
