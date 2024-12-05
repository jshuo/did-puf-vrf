import { useMemo } from "react";
import { ethers } from "ethers";
import type { Chain, Client, Transport } from "viem";
import { Config, useClient } from "wagmi";

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new ethers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new ethers.JsonRpcProvider(value?.url, network),
      ),
    );
  return new ethers.JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number | undefined } = {}) {
  const client = useClient<Config>({ chainId });
  return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}
