"use client";

import Image from "next/image";
import Link from "next/link";
import ImageGrid from "../components/ImageGrid";
import { NetworkSwitcher } from "../components/NetworkSwitcher";
import type { NextPage } from "next";
import { FaUsb } from "react-icons/fa";
import { SiEthereum } from "react-icons/si";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">
              Cutting-Edge EVM-Compatible dApps
            </span>
            <span className="block text-4xl font-bold">
              for Enterprise Supply Chain,  RWA Management and VRF
            </span>
            <span className="block text-4xl font-bold">
             via ERC1056/ERC3643/VRF SC worker with NeoPUF USB Dongle/HSM 
            </span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium"></p>
            <NetworkSwitcher />
          </div>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
            <p>
              <Link href="/calltoactions" passHref className="link">
                Call To Actions
              </Link>{" "}
            </p>
          </div>
          <ImageGrid />
          <br />
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              <Image src="/did-puf-sc.png" alt="Example Image" width={500} height={250} />
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SiEthereum size={50} />
              <p>
                <Link href="/issuer" passHref className="link">
                  DID Issuer App
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <FaUsb size={50} />
              <p>
                <Link href="/signer" passHref className="link">
                  DID Delegate Signer App
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SiEthereum size={50} />
              <p>
                <Link href="/verifier" passHref className="link">
                  DID Verifier App
                </Link>{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              <Image src="/rwa-1.png" alt="Example Image" width={500} height={250} />
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SiEthereum size={50} />
              <p>
                <Link href="/issuer" passHref className="link">
                  RWA Token Issuer / <b>Agents</b> App
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SiEthereum size={50} />
              <p>
                <Link href="/issuer" passHref className="link">
                  DID Claim Issuer App
                </Link>{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <SiEthereum size={50} />
              <p>
                <Link href="/verifier" passHref className="link">
                  DID Investor App
                </Link>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-ai-board.png" alt="Example Image" width={1000} height={600} />
      </div>
    </>
  );
};

export default Home;
