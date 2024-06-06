"use client";

import Head from "next/head";
import { Account } from "../../components/Account";

export default function IssuerPage() {
  return (
    <div>
      <Head>
        <title>DID Issuers Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Issuers Page (Department of Defense or OEMs) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Issuer Account</b> <Account />
              </h2>
              <hr />
              <ol>
                <li>1. Create a NeoPUF USB Dongle signing delegate for the connected DID Issuer Account</li>
                <li>2. Bind DID Issuer EVM address with Signer SEC256R1 Public key</li>
                <li>3. Register the binding to ERC1056 smart contract</li>
              </ol>
              <button className="btn btn-blue" id="createDelegate">
                Create Delegate
              </button>

              <h3>
                Delegate Signer SEC256R1 Public key: <span id="delegateSigner"></span>
              </h3>
              <h3>
                Delegate Signer Identifier: <span id="delegateSignerIdentifier"></span>
              </h3>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>
    </div>
  );
}
