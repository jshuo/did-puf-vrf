"use client";

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Account } from "../../components/Account";
import { useEthersProvider } from "../ethers/useEthersProvider";
import { useEthersSigner } from "../ethers/useEthersSigner";
import * as didJWT from "did-jwt";
import { Resolver } from "did-resolver";
import { EthrDID } from "ethr-did";
import { getResolver } from "ethr-did-resolver";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type unsignedJWT = {
  payload: didJWT.JWTPayload;
  options?: {
    issuer: string; // Removed signer in order to be able to prepare the message
  };
  header?: {
    alg: string;
  };
};



export default function IssuerPage() {
  const [subjectAddress, setSubjectAddress] = useState("");
  const [audienceAddress, setAudienceAddress] = useState("");
  const [veriableClaim, setVeriableClaim] = useState("");
  const [subjectDID, setSubjectDID] = useState("");
  const [audienceDID, setAudienceDID] = useState("");
  const [issuerDID, setIssuerDID] = useState("");
  const [issuerDid, setIssuerDid] = useState<EthrDID>();
  const [audienceDid, setAudienceDid] = useState<EthrDID>();
  const [subjectDid, setSubjectDid] = useState<EthrDID>();
  const [signedJWT, setSignedJWT] = useState<string | undefined>("");
  const [JWTMessage, setJWTMessage] = useState<unsignedJWT | null>(null);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const hardHatRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // hardhat localhost
  const PolyAmoyRegistryAddress = "0x87dB91CE729dB1E1f7F5d830a4C7348De1931c2D"; // polygon
  const AgenceRegistryAddress = "0xed7D83a174AfC0C148588dc8028225A3cc7e91AB"; // agence
  const { targetNetwork } = useTargetNetwork();
  const jetsonData = {
    "Jetson_AGX_Orin_32GB": {
      "AI_Performance": "200 TOPS (INT8)",
      "GPU": "NVIDIA Ampere architecture with 1792 NVIDIA CUDA cores and 56 Tensor Cores",
      "Max_GPU_Freq": "930 MHz",
      "CPU": "8-core Arm Cortex-A78AE v8.2 64-bit CPU, 2MB L2 + 4MB L3",
      "CPU_Max_Freq": "2.2 GHz",
      "DL_Accelerator": "2x NVDLA v2.0",
      "DLA_Max_Frequency": "1.4 GHz",
      "Vision_Accelerator": "PVA v2.0",
      "Memory": "32GB 256-bit LPDDR5, 204.8 GB/s",
      "Storage": "64GB eMMC 5.1",
      "CSI_Camera": "Up to 6 cameras (16 via virtual channels), 16 lanes MIPI CSI-2, D-PHY 2.1 (up to 40Gbps) | C-PHY 2.0 (up to 164Gbps)",
      "Video_Encode": "1x 4K60 | 3x 4K30 | 6x 1080p60 | 12x 1080p30 (H.265), H.264, AV1",
      "Video_Decode": "1x 8K30 | 2x 4K60 | 4x 4K30 | 9x 1080p60| 18x 1080p30 (H.265), H.264, VP9, AV1",
      "UPHY": "Up to 2 x8, 1 x4, 2 x1 (PCIe Gen4, Root Port & Endpoint), 3x USB 3.2",
      "Networking": "1x GbE",
      "Display": "1x 8K60 multi-mode DP 1.4a (+MST)/eDP 1.4a/HDMI 2.1",
      "Other_IO": "4x USB 2.0, 4x UART, 3x SPI, 4x I2S, 8x I2C, 2x CAN, DMIC & DSPK, GPIOs",
      "Power": "15W - 40W",
      "Mechanical": "100mm x 87mm, 699-pin Molex Mirror Mezz Connector, Integrated Thermal Transfer Plate"
    }
  }


  const providerConfig = {
    networks: [
      {
        name: "development",
        rpcUrl: "http://localhost:7545",
        chainId: 31337,
        provider,
        registry: hardHatRegistryAddress,
      },
      {
        name: "agence",
        rpcUrl: "https://takecopter.cloud.agence.network",
        chainId: 887,
        provider,
        registry: AgenceRegistryAddress,
      },
      {
        name: "PolygonAmoy",
        rpcUrl: "https://rpc-amoy.polygon.technology",
        chainId: 80002,
        provider,
        registry: PolyAmoyRegistryAddress,
      },
    ],
  };
  const ethrDidResolver = getResolver(providerConfig);
  const didResolver = new Resolver(ethrDidResolver);
  let issuerAddress: string, chainNameOrId: number;

  const processDid = async () => {

    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }
    const subjectAddr = subjectAddress || "0xDBB3d90156fC23c28C709eB68af8403836951AF8";
    const audienceAddr = audienceAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const subjectDid = new EthrDID({ identifier: subjectAddr, provider, chainNameOrId });
    const audienceDid = new EthrDID({ identifier: audienceAddr, provider, chainNameOrId });
    let registryAddress;
    if (targetNetwork.id == 80002) {
      registryAddress = PolyAmoyRegistryAddress;
    } else if (targetNetwork.id == 887) {
      registryAddress = AgenceRegistryAddress;
    } else if (targetNetwork.id == 31337) {
      registryAddress = hardHatRegistryAddress;
    }

    const issuerDid = new EthrDID({
      identifier: issuerAddress,
      provider,
      chainNameOrId,
      registry: registryAddress,
      txSigner: signer,
      alg: "ES256K",
    });

    setSubjectDID(subjectDid.did);
    setAudienceDID(audienceDid.did);
    setIssuerDID(issuerDid.did);
    setIssuerDid(issuerDid);
    setSubjectDid(subjectDid);
    setAudienceDid(audienceDid);
  };

  const prepareJWT = async () => {
    if (signer) {
      issuerAddress = await signer.getAddress();
      chainNameOrId = await signer.getChainId();
    }

    const buildJWT = {
      payload: {
        iss: issuerDid?.did,
        sub: subjectDid?.did,
        aud: audienceDid?.did,
        veriableClaim: veriableClaim || {
          id: "did:neopuf:4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
          product: {
            name: "Clife key C series",
            category: "FIDO",
            description: {
              en: "Clife key is a ChipWon Technology product, certified by the FIDO Association. It offers strong multi-factor authentication (MFA) and secure login.",
              zh: "Clife key 是群旺科技的產品，通過FIDO協會認證。提供強大的多因素身份驗證 (MFA) 和安全登錄。"
            },
            features: {
              en: [
                "Supports FIDO protocols: WebAuthn, FIDO2 CTAP1, FIDO2 CTAP2, U2F.",
                "Compatible with Windows, MacOS, Linux, iOS, Android, ChromeOS.",
                "Flexible authentication options: single-factor, 2FA, MFA. Durable, tamper-proof, water-resistant, crush-proof. Made in Taiwan."
              ],
              zh: [
                "支援FIDO協議: WebAuthn, FIDO2 CTAP1, FIDO2 CTAP2, U2F。",
                "兼容Windows, MacOS, Linux, iOS, Android, ChromeOS。",
                "靈活的身份驗證選項: 單因素, 2FA, MFA。耐用、防篡改、防水、防擠壓。台灣製造。"
              ]
            }
          },
          serialNumber: "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
          uuid: "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
          chipFingerprintId: "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3"

        },
      },
    };
    setJWTMessage(buildJWT);
  };


  const signJWT = async () => {
    if (!JWTMessage) return;
    //  should check if delegate signer is one of the issuer delegates 
    // the following operation is expensive;  should be cached 
    // comment it out for now for response time 
    // if (issuerDid != undefined) {
    //   const issuerDoc = await didResolver.resolve(issuerDid.did);
    //   console.log(issuerDoc);
    // }
    const signedJWT: string | undefined = await issuerDid?.signJWT(JWTMessage.payload);
    if (signedJWT != undefined) localStorage.setItem('jwt', signedJWT);
    setSignedJWT(signedJWT);

  };

  return (
    <div>
      <Head>
        <title>DID Issuers Page</title>
      </Head>
      <main>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">DID Delegate Signer Page (Manufacturers / Agents) App</span>
            <span className="block text-4xl font-bold">For Enterprise Supply Chain Management</span>
          </h1>
          <hr />
          <h2>
            <span className="block text-2xl mb-2">
              <h2>
                <b>DID Signer:</b> <p></p>
              </h2>
              <p></p>
              <hr />
              <ul className="list-disc" style={{ marginLeft: '20px' }}>
                <li> A delegate signer is an entity authorized to act on behalf of the identity owner (i.e. its DID issuer). Our design modifies ethr-did to utilize a secp256r1 hardware/PUF-based USB dongle on the client side or an HSM on the server side as the delegate signer.</li>
                <li>
                  This authorization is managed by the identity owner  (i.e. its DID issuer) and is recorded on the blockchain.
                </li>
                <li> Delegation can be time-bound. The identity owner (i.e. its DID issuer) can set an expiration date for the delegates authority, ensuring that the delegation is temporary and needs to be renewed periodically</li>
                <li> The identity owner has the power to revoke the delegation at any time, effectively removing the delegates authority to act on behalf of the identity.</li>
                <li>
                  This revocation is also recorded on the blockchain, ensuring transparency and security.
                </li>
                <li>  Delegate signers add a layer of security and flexibility. The identity owner (i.e. its DID issuer) does not need to use their private key for every transaction, reducing the risk of key exposure.</li>
              </ul>

              <section>
                <br />
                <h2 className="block text-2xl mb-2 font-bold">Configure subject and audience DIDs</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    processDid();
                  }}
                >
                  <label>
                    Subject Address:
                    <input type="text" value={subjectAddress} onChange={e => setSubjectAddress(e.target.value)} />
                  </label>
                  <br />
                  <label>
                    Audience Address:
                    <input type="text" value={audienceAddress} onChange={e => setAudienceAddress(e.target.value)} />
                  </label>
                  <br />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    onMouseOver={e => {
                      e.target.style.backgroundColor = "#0056b3";
                    }}
                    onMouseOut={e => {
                      e.target.style.backgroundColor = "#007BFF";
                    }}                  >
                    Configure Addresses
                  </button>
                </form>
                <br />
                <span id="subjectDID">Subject Address: {subjectDID}</span>
                <br />
                <span id="audienceDID">Verifier Address: {audienceDID}</span>
                <br />
                <span id="issuerDID">Issuer Address: {issuerDID}</span>
                <br />
              </section>
              <section>
                <h2 className="block text-2xl mb-2 font-bold"> Enter Raw Claim, and then prepare JWT Token for Signing</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    prepareJWT();
                  }}
                >
                  <label>
                    <textarea
                      value={veriableClaim}
                      placeholder={JSON.stringify(jetsonData)}
                      onChange={e => setVeriableClaim(JSON.stringify(jetsonData))}
                      style={{
                        width: "800px", // Adjust width as needed
                        height: "200px", // Adjust width as needed
                        padding: "8px", // Adjust padding for uniformity with the button
                        marginRight: "10px", // Optional: Provide spacing between input and button
                      }}
                    />
                  </label>
                  <br />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#007BFF",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    onMouseOver={e => {
                      e.target.style.backgroundColor = "#0056b3";
                    }}
                    onMouseOut={e => {
                      e.target.style.backgroundColor = "#007BFF";
                    }}                   >
                    Prepare JWT
                  </button>
                </form>

              </section>
              <section>
                <h2></h2>
                <button
                  onClick={signJWT}
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  onMouseOver={e => {
                    e.target.style.backgroundColor = "#0056b3";
                  }}
                  onMouseOut={e => {
                    e.target.style.backgroundColor = "#007BFF";
                  }}                 >
                  Sign JWT
                </button>
                <span id="signedJWT">{signedJWT}</span>
                <br />
              </section>
            </span>
          </h2>
        </div>
        <hr />

        <br />
      </main>
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <Image src="/puf-did-diagram.png" alt="Example Image" width={800} height={600} />
        <Image src="/puf-did-ai-board.png" alt="Example Image" width={800} height={600} />
      </div>
    </div>
  );
}
