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

export default function IssuerPage() {
  return (
    <div>
      <Head>
        <title>Simple Next.js Page</title>
      </Head>
      <main>
        <hr />
        <h2>Create Signing Delegate</h2>
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

        <h2>Account</h2>
        <Account />
        <br />
      </main>
    </div>
  );
}
