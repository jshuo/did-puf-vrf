"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

export default function SignerPage() {
  const [claimDescription, setClaimDescription] = useState(
    "This AI Board is certified to have undergone rigorous testing for high-performance AI applications.",
  );
  const [chipFingerprint, setChipFingerprint] = useState("AC2D3F147E98B6");

  const createDelegate = () => {
    // Handle form submission here
    console.log("Submitted Claim Description:", claimDescription);
    console.log("Submitted Chip Fingerprint:", chipFingerprint);
  };

  return (
    <div>
      <Head>
        <title>DID Issuers Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Signer Page (ODMs or Manufacturers) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
            <span className="block text-4xl font-bold">Intranet/Offline/Internet</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Issuer Account: e.g. Winstron, Quanta CT, Foxconn, Acer, Asus..etc</b> <p></p>
                <b>Chip on Board: e.g. Nivida, AMD, Qualcomm, Intel..etc</b> <p></p>
              </h2>
              <p></p>
              <hr />
              <ol>
                <li>. Neo PUF HSM on the server </li>
                <li>. or NeoPUF USB Dongle on the manufacturing line </li>
                <li>. NeoPUF USB Dongle expiration date is set by smart contract ERC1056 </li>
              </ol>
              <p></p>
              <h1>
                <b>DID Verifiable Claim</b>
              </h1>
              <p></p>
              <form onSubmit={createDelegate}>
                <div>
                  <label htmlFor="claim-description">Claim Description:</label>
                  <br />
                  <input
                    type="text"
                    id="claim-description"
                    name="claim-description"
                    value={claimDescription}
                    onChange={e => setClaimDescription(e.target.value)}
                  />
                  <br />
                  <br />
                </div>
                <div>
                  <label htmlFor="chip-fingerprint">Chip Fingerprint:</label>
                  <br />
                  <input
                    type="text"
                    id="chip-fingerprint"
                    name="chip-fingerprint"
                    value={chipFingerprint}
                    onChange={e => setChipFingerprint(e.target.value)}
                  />
                  <br />
                  <br />
                </div>
                <button className="btn btn-blue" type="submit">
                  Sign Verifiable Claim
                </button>
              </form>
            </span>
          </h2>
        </div>
      </main>

      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-diagram.png" alt="Example Image" width={1000} height={600} />
      </div>
    </div>
  );
}
