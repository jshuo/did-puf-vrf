"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import { EthrDID } from "ethr-did";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export default function IssuerPage() {
  const [delegateSigner, setDelegateSigner] = useState("");
  const [delegateSignerIdentifier, setDelegateSignerIdentifier] = useState("");
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const { targetNetwork } = useTargetNetwork();

  let issuerAddress: string, chainNameOrId: number;

  const createDelegate = async () => {
    if (signer) {
      let registryAddress;
      if (targetNetwork.id == 80002) {
        registryAddress = PolyAmoyRegistryAddress;
      } else if (targetNetwork.id == 887) {
        registryAddress = AgenceRegistryAddress;
      } else if (targetNetwork.id == 31337) {
        registryAddress = hardHatRegistryAddress;
      }
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
      const issuerDid = new EthrDID({
        identifier: issuerAddress,
        provider,
        chainNameOrId,
        registry: registryAddress,
        txSigner: signer,
        alg: "ES256K",
      });
      const { kp, txHash } = (await issuerDid?.createSigningDelegate()) || { kp: undefined };
      if (kp !== undefined) {
        console.log(txHash);
        setDelegateSigner(kp.address);
        setDelegateSignerIdentifier(kp.identifier);
      }
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

              <section>
                <button
                  onClick={createDelegate}
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
                  Create Delegate
                </button>
                <section>
                </section>
                <br />
                <span
                  id="delegateSigner" className="block text-2xl font-bold"            >
                  delegate signer secp256 r1 address: 
                </span>
                {delegateSigner}
                <br />
                <span
                 id="delegateSigner" className="block text-2xl font-bold"            >
                  delegate signer secp256 r1 public key: 
                </span>
                {delegateSignerIdentifier}
                <br />
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
