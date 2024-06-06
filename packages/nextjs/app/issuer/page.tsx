// app/issuer/page.tsx
"use client";

import Head from "next/head";
import { Account } from "../../components/Account";

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

// app/issuer/page.tsx

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
              <ul>
                <li>Create a NeoPUF USB Dongle signing delegate for the connected DID Issuer Account</li>
              </ul>
            </span>
          </h2>
        </div>
        <hr />

        <ul>
          <li>Create a signing delegate for the connected account</li>
        </ul>
        <button id="createDelegate">Create Delegate</button>
        <h3>
          Delegate Signer Account: <span id="delegateSigner"></span>
        </h3>
        <h3>
          Delegate Signer Identifier: <span id="delegateSignerIdentifier"></span>
        </h3>

        <br />
      </main>
    </div>
  );
}
