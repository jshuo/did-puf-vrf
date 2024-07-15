"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import { EthrDID } from "ethr-did";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import {
  Signer as JWTSigner,
  ES256HSMSigner
} from 'did-jwt'

export default function IssuerPage() {
  const [delegateSigner, setDelegateSigner] = useState("");
  const [delegateSignerIdentifier, setDelegateSignerIdentifier] = useState("");
  const [expireIn, setExpireIn] = useState('');

  const [loading, setLoading] = useState(false);


  const handleInputChange = (e) => {
    setExpireIn(e.target.value);
  };
  const provider = useEthersProvider();
  const rpcSigner = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0xEd9950CAfa9F5c148f0830aFfa27B521cea22906"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const BesuRegistryAddress = "0xF4a9DDc96DB10650445B03e66117baAdC4c88E66"; // besu
  const { targetNetwork } = useTargetNetwork();
  const pufHsmRemoteUrl = process.env.NEXT_PUBLIC_PUF_HSM_REMOTE_URL || "http://192.168.0.161:8088/"

  let issuerAddress: string, chainNameOrId: number;
  let signer: JWTSigner = ES256HSMSigner(pufHsmRemoteUrl)


  const createDelegate = async (expiresIn: string) => {
    enum DelegateTypes {
      veriKey = 'veriKey',
      sigAuth = 'sigAuth',
      enc = 'enc',
    }

    setLoading(true); // Set loading state to true
    if (rpcSigner) {
      let registryAddress;
      if (targetNetwork.id == 80002) {
        registryAddress = PolyAmoyRegistryAddress;
      } else if (targetNetwork.id == 887) {
        registryAddress = AgenceRegistryAddress;
      } else if (targetNetwork.id == 31337) {
        registryAddress = hardHatRegistryAddress;
      }
      else if (targetNetwork.id == 1981) {
        registryAddress = BesuRegistryAddress;
      }
      issuerAddress = await rpcSigner.getAddress();
      chainNameOrId = await rpcSigner.getChainId();
      const issuerDid = new EthrDID({
        identifier: issuerAddress,
        provider,
        chainNameOrId,
        registry: registryAddress,
        txSigner: rpcSigner,
        alg: "ES256K",
        signer
      });
      const { address, pubkey, txHash } = (await issuerDid?.createSigningDelegate(DelegateTypes.veriKey, parseInt(expiresIn), pufHsmRemoteUrl));
      if (address !== undefined) {
        console.log(txHash);
        setDelegateSigner(address);
        setDelegateSignerIdentifier(pubkey);
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

              <ul className="list-disc" style={{ marginLeft: '20px' }}>
                <li>Create a NeoPUF USB Dongle / HSM signing delegate for the connected DID Issuer Account</li>
                <li>
                  Bind DID Issuer EVM address (derivative of SECP256K1) with Signer SECP256R1 (or P-256) Public key
                </li>
                <li> Delegation can be time-bound. The identity owner (i.e. its DID issuer) can set an expiration date for the delegates authority, ensuring that the delegation is temporary and needs to be renewed periodically</li>
                <li> Register the binding to ERC1056 smart contract</li>
                <li> The identity owner has the power to revoke the delegation at any time, effectively removing the delegates authority to act on behalf of the identity.</li>
                <li>
                  This revocation is also recorded on the blockchain, ensuring transparency and security.
                </li>
                <li>  Delegate signers add a layer of security and flexibility, and with PUF USB, Delegate signers private keys are neither be exposed or accessed  </li>
                <li>  The identity owner (i.e. its DID issuer) does not need to use their private key for every transaction, reducing the risk of key exposure.</li>
              </ul>
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
