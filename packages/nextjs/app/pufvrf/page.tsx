"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";


export default function PUFVRFPage() {


  return (
    <div>
      <Head>
        <title>PUF VRF Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">PUF VRF Page App</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>PUF VRF:</b> <p></p> <Account />
              </h2>
              <p></p>
              <hr />
              <table>
                <tr>
                  <td>              <ul className="list-disc" style={{ marginLeft: '20px' }}>

                    <li style={{ marginBottom: '20px' }}>Taiwan Lotto 6/49</li>
                    <li style={{ marginBottom: '20px' }}>Super Lotto</li>
                    <li style={{ marginBottom: '20px' }}>Daily Cash 539</li>
                    <li style={{ marginBottom: '20px' }}>Lotto 6/38</li>
                    <li style={{ marginBottom: '20px' }}>Power Lottery (Bingo Bingo)</li>
                    <li style={{ marginBottom: '20px' }}>Big Lotto</li>
                    <li style={{ marginBottom: '20px' }}>Three-Star</li>
                    <li style={{ marginBottom: '20px' }}>Four-Star</li>
                    <li style={{ marginBottom: '20px' }}>Lottery 5/39</li>
                    <li style={{ marginBottom: '20px' }}>39M</li>
                  </ul></td>
                  <td>             <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                    <Image src="/pufvrf-1.png" alt="Example Image" width={550} height={450} />

                  </div></td>
                </tr>
              </table>

              <hr />


            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>
    </div>
  );
}
