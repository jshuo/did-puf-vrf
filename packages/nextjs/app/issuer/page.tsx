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
  const [subjectDID, setSubjectDID] = useState("");
  const [audienceDID, setAudienceDID] = useState("");
  const [privateClaim, setPrivateClaim] = useState("");
  const [issuerDID, setIssuerDID] = useState("");
  const [delegateSigner, setDelegateSigner] = useState("");
  const [delegateSignerIdentifier, setDelegateSignerIdentifier] = useState("");
  const [connectedMetamaskAccount, setConnectedMetamaskAccount] = useState("");
  const [signedJWT, setSignedJWT] = useState("");
  let JWTMessage: unsignedJWT; // Unsigned JWT message
  const [issuerDid, setIssuerDid] = useState(null);
  const chainId = 80002;
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });
  const registryAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
  const providerConfig = {
    networks: [{ name: "0x13882", provider }],
    registry: registryAddress,
  };
  const ethrDidResolver = getResolver(providerConfig);
  const didResolver = new Resolver(ethrDidResolver);
  let issuerAddress: string, chainNameOrId: number;

  const processDid = async () => {
    const chainNameOrId = chainId;
    const subjectAddr = subjectAddress || "0xDBB3d90156fC23c28C709eB68af8403836951AF8";
    const audienceAddr = audienceAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const subjectDid = new EthrDID({ identifier: subjectAddr, provider, chainNameOrId });
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });

    setSubjectDID(subjectDid.did);
    setAudienceDID(audienceDid.did);
  };

  const prepareJWT = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }

    const issuerDid = new EthrDID({ identifier: issuerAddress, provider, chainNameOrId });

    const buildJWT = {
      payload: {
        iss: issuerDid.did,
        sub: subjectDID,
        aud: audienceDID,
        privateClaim: privateClaim || "DEFAULT_PRIVATE_CLAIM",
      },
    };

    setIssuerDID(issuerDid.did);
    JWTMessage = buildJWT;
  };

  const createDelegate = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }

    const issuerDid = new EthrDID({
      identifier: issuerAddress,
      provider,
      chainNameOrId,
      txSigner: signer,
      alg: "ES256K",
    });

    const { kp } = await issuerDid.createSigningDelegate();
    setDelegateSigner(kp.address);
    setDelegateSignerIdentifier(kp.identifier);
  };

  const signJWT = async () => {
    if (!JWTMessage) return;

    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();

      const issuerDid = new EthrDID({
        identifier: issuerAddress,
        provider,
        chainNameOrId,
        txSigner: signer,
        alg: "ES256K",
      });
      const signedJWT = await issuerDid.signJWT(JWTMessage.payload);

      setSignedJWT(signedJWT);

      setConnectedMetamaskAccount(await signer.getAddress());

      const issuerDoc = await didResolver.resolve(issuerDid.did);
      console.debug(issuerDoc);
    }
    await fetch("/api/saveJWT", {
      method: "POST",
      body: JSON.stringify({ signedJWT }),
      headers: { "Content-type": "application/json" },
    }).then(async res => {
      const message = await res.text();
      console.log(JSON.parse(message).message);
    });
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
                <b>DID Issuer Account: e.g. 國防部, Google, Telsa.. Magnificent 7 etc</b> <p></p> <Account />
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
                  <button type="submit">Configure Addresses</button>
                </form>
                <span id="subjectDID">{subjectDID}</span>
                <span id="audienceDID">{audienceDID}</span>
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
                    <input type="text" value={privateClaim} onChange={e => setPrivateClaim(e.target.value)} />
                  </label>
                  <button type="submit">Prepare JWT</button>
                </form>
                <span id="issuerDID">{issuerDID}</span>
              </section>
              <section>
                <h2>Create Signing Delegate</h2>
                <button onClick={createDelegate}>Create Delegate</button>
                <span id="delegateSigner">{delegateSigner}</span>
                <span id="delegateSignerIdentifier">{delegateSignerIdentifier}</span>
              </section>
              <section>
                <h2>Sign JWT Token</h2>
                <button onClick={signJWT}>Sign JWT</button>
                <span id="connectedMetamaskAccount">{connectedMetamaskAccount}</span>
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
