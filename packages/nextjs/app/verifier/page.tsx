"use client";

import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";

export default function VerifierPage() {
  return (
    <div>
      <Head>
        <title>DID Verifier Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">
              {" "}
              <a href="https://amoy.polygonscan.com/tx/0x6c3afc136ee830971a354ea9b9fcbfb1d2bbb740864b3431885deceb49740e52">
                View <b>Added NeoPUF USB Delegate Signer Publickey on EVM net</b>
              </a>
            </span>
          </h1>
          <hr />
        </div>
      </main>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/adddelegate-1.png" alt="Example Image" width={800} height={600} />
        <Image src="/adddelegate-2.png" alt="Example Image" width={800} height={600} />
      </div>
    </div>
  );
}
