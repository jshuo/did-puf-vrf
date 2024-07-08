"use client";

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";
import { type Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { wagmiContractConfig } from './contracts';


export default function ReadContract() {



  return (
    <div>
      <Head>
        <title>Real World Asset Token Investor</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">RWA Token Investor App</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>RWA Token Investor:</b> <p></p> <Account />
              </h2>
              <p></p>
              <hr />

              <ul className="list-disc" style={{ marginLeft: '20px' }}>

                <li style={{ marginBottom: '20px' }}> <STOSymbol /></li>
                <li style={{ marginBottom: '20px' }}> <TotalSupply/></li>    
                <li style={{ marginBottom: '20px' }}> <BalanceOf /></li>             
              </ul>
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

const TotalSupply = () => {
  const { data, isRefetching, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'totalSupply',
  });

  return (
    <div>

      <b style={{ fontSize: '28px' }}>Total Supply: {data?.toString()} SET</b>

      <br />
    </div>
  );
};


const STOSymbol = () => {
  const { data, isRefetching, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'symbol',
  });

  return (
    <div>
      <b style={{ fontSize: '28px' }}>Stock Symbol: {data?.toString()}</b>
      <br />
    </div>
  );
};
const BalanceOf = () => {
  const { address } = useAccount()

  const { data, isSuccess } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: [address],
  });


  return (
    <div>
      <b style={{ fontSize: '28px' }}>Token balance:{isSuccess && data?.toString()} SET</b>
      <br />
    </div>
  );
};
