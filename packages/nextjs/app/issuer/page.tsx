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
  const [expireIn, setExpireIn] = useState('');

  const [loading, setLoading] = useState(false);


  const handleInputChange = (e) => {
    setExpireIn(e.target.value);
  };
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const { targetNetwork } = useTargetNetwork();

  let issuerAddress: string, chainNameOrId: number;

  const createDelegate = async (expiresIn: string) => {
    enum DelegateTypes {
      veriKey = 'veriKey',
      sigAuth = 'sigAuth',
      enc = 'enc',
    }

    setLoading(true); // Set loading state to true
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
      const { kp, txHash } = (await issuerDid?.createSigningDelegate(DelegateTypes.veriKey, parseInt(expiresIn))) || { kp: undefined };
      if (kp !== undefined) {
        console.log(txHash);
        setDelegateSigner(kp.address);
        setDelegateSignerIdentifier(kp.identifier);
        setLoading(false); // Set loading state to false after processing
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
              <hr />

              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                <Image src="/puf-did-ai-board.png" alt="Example Image" width={550} height={450} />
                <Image src="/puf-did-diagram.png" alt="Example Image" width={600} height={450} />

              </div>
              <section>
                <label className="block text-2xl font-bold"> Create Delegate Signer w/Expiration (seconds)
                  <br />
                  <button
                    onClick={() => createDelegate(expireIn)}
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

                  <input
                    type="text"
                    value={expireIn}
                    onChange={handleInputChange}
                    placeholder=""
                    style={{
                      width: "80px", // Adjust width as needed
                      marginBottom: "10px",
                      padding: "10px",
                      fontSize: "16px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
                <section>
                </section>
                <br />
                <span
                  id="delegateSigner" className="block text-2xl font-bold"            >
                  delegate signer secp256 r1 address:
                </span>
                {loading ? (
                  <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
                ) : (
                  <div className="block text-2xl" > {delegateSigner}</div>
                )}

                <br />
                <span
                  id="delegateSigner" className="block text-2xl font-bold"            >
                  delegate signer secp256 r1 public key:
                </span>
                {loading ? (
                  <div className="loading-spinner">Loading...</div> // Replace with your loading spinner or animation component
                ) : (
                  <div className="block text-2xl" >  {delegateSignerIdentifier}</div>
                )}

                <br />
              </section>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>


    </div>
  );
}
