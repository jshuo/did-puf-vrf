// app/issuer/page.tsx
"use client";

import Head from "next/head";
import Image from "next/image";

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
        <h1>Welcome to the Issuer Page</h1>
        <p>This is a simple Next.js page.</p>
        <ul>
          <li>First item in the list</li>
          <li>Second item in the list</li>
          <li>Third item in the list</li>
        </ul>
        <a href="/">
          <button>Home</button>
        </a>
        <a href="/audience">
          <button>Audience App</button>
        </a>
      </main>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-ai-board.png" alt="Example Image" width={1000} height={600} />
      </div>
    </div>
  );
}
