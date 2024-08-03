import * as chains from "wagmi/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const BESU_RPC = "http://58.115.23.124:8545";
// const besuRpc = process.env.BESU_RPC;

const scaffoldConfig = {
  // The network where your DApp lives in
  // targetNetworks: [chains.hardhat],

  targetNetworks: [
    {
      name: "Hyperledger Besu",
      id: 1981,
      nativeCurrency: {
        name: "Besu",
        symbol: "BESU",
        decimals: 2,
      },
      rpcUrls: {
        public: {
          http: [BESU_RPC],
        },
        default: {
          http: [BESU_RPC],
        },
      },
      testnet: true,
    },
    {
      name: "Agence",
      id: 887,
      nativeCurrency: {
        name: "Agence",
        symbol: "HME",
        decimals: 2,
      },
      rpcUrls: {
        public: {
          http: ["https://takecopter.cloud.agence.network"],
          webSocket: ["wss://takecopter.cloud.agence.network"],
        },
        default: {
          http: ["https://takecopter.cloud.agence.network"],
          webSocket: ["wss://takecopter.cloud.agence.network"],
        },
      },
      blockExplorers: {
        default: {
          name: "Agence Blockscout",
          url: "https://blockscout.takecopter.cloud.agence.network/",
        },
      },
      testnet: true,
    },
    chains.polygonAmoy,
    chains.avalanche,
  ],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
