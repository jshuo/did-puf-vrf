"use client";

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { BaseError } from 'viem';

import { type Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { wagmiContractConfig } from './contracts';


export default function ReadContract() {


  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center"><STOSymbol /></h1>
        <br />
        <h1 className="text-center"><BalanceOf /></h1>
        <br />
        <h1 className="text-center"> <TotalSupply /></h1>
        <br />

      </div>
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

      <b style={{ fontSize: '28px' }}>Total Supply: {data?.toString()}</b>

      <br />
      <button disabled={isRefetching} onClick={() => refetch()} style={{ marginLeft: 4 }}>
        {isRefetching ? 'loading...' : 'refetch'}
      </button>
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

  const { data, error, isLoading, isSuccess } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: [address],
  });


  const [value, setValue] = useState<string>(address);

  return (
    <div>
      <b style={{ fontSize: '28px' }}>Token balance:{isSuccess && data?.toString()}</b>
      <br />
    </div>
  );
};
