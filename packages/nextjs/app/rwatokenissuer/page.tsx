"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";


export default function RWATokenIssuerPage() {


  return (
    <div>
      <Head>
        <title>RWA Token Issuer Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">RWA Token Issuer Page App</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>Real World Asset Tokenization Issuer:</b> <p></p> <Account />
              </h2>
              <p></p>
              <hr />

              <ul className="list-disc" style={{ marginLeft: '20px' }}>

                <li style={{ marginBottom: '20px' }}> Real Estate Property - Real World Asset Tokenization </li>
                <li style={{ marginBottom: '20px' }}> Security Token Offering - Fund Raising - Real World Asset Tokenization </li>
               </ul>
              <hr />

              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                <Image src="/rwaproperty.png" alt="Example Image" width={550} height={450} />
                <Image src="/rwasto.png" alt="Example Image" width={550} height={450} />

              </div>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>
    </div>
  );
}
