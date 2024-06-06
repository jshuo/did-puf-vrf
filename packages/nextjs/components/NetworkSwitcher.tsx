import { useAccount, useSwitchChain } from "wagmi";

export function NetworkSwitcher() {
  const { chain } = useAccount();
  const { chains, switchChain, status, failureReason } = useSwitchChain();

  return (
    <div>
      <div className="my-2 font-medium">
        Switch to Ethereum Virtual Machine Type:{" "}
        {chains.map(x =>
          x.id === chain?.id ? null : (
            <button className="btn btn-blue" key={x.id} onClick={() => switchChain({ chainId: x.id })}>
              {" "}
              {x.name}
              {status === "pending" && " (switching)"}
            </button>
          ),
        )}
      </div>

      <div>{failureReason?.message}</div>
    </div>
  );
}
