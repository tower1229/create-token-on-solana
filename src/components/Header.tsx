import { Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { shortString } from "@/utils";
import { Plugs, Wallet } from "@phosphor-icons/react";
import { getStore, autorun } from "@/store";

const ConnectSolanaButton = function ConnectSolanaButton() {
  const { Channel, Network } = getStore();
  const { connected, publicKey, select, connect, disconnect } = useWallet();
  const [isSelect, toggleSelect] = useState(false);

  const walletAddress = useMemo(
    () => publicKey?.toBase58(),
    [publicKey, connected]
  );

  useEffect(() => {
    if (isSelect && connect) {
      connect()
        .then(() => {
          console.log("connect success");
        })
        .catch((error) => toast.error(error));
    }

  }, [isSelect, connect]);

  const handleConnect = () => {
    if (!connected) {
      select(new PhantomWalletAdapter().name);
      toggleSelect(true);
    }
  };

  const handleLogout = () => {
    disconnect();
  };

  const handleSwitchNetwork = (network: 'solana' | 'solana-devnet') => {
    Network.setNetwork(network);
  };

  useEffect(() => {
    autorun(() => {
      if (Channel.callingCommand === "connect") {
        handleConnect();
        Channel.stopCalling();
      }
    });
  }, []);

  return (
    <>
      {connected ? (
        <div className="join">
          <div className="dropdown dropdown-end join-item">
            <button className="my-2 btn  btn-neutral join-item ">
              {Network.currentNetwork === "solana" ? "Mainnet" : "Devnet"}
            </button>
            <ul
              tabIndex={0}
              className="rounded-lg bg-base-100 shadow p-2 w-28 z-[1] dropdown-content menu"
            >
              <li>
                <a
                  onClick={() => handleSwitchNetwork('solana')}
                  className={Network.currentNetwork === 'solana' ? 'active' : ''}
                >
                  Mainnet
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleSwitchNetwork('solana-devnet')}
                  className={Network.currentNetwork === 'solana-devnet' ? 'active' : ''}
                >
                  Devnet
                </a>
              </li>
            </ul>
          </div>
          <div className="dropdown dropdown-hover dropdown-end">
            <button className="my-2 btn-primary btn btn-outline join-item">
              <Wallet size={24} />
              {shortString(walletAddress || "--", 6, 6)}
            </button>

            <ul
              tabIndex={0}
              className="rounded-lg bg-base-100 shadow p-2 w-44 z-[1] dropdown-content menu"
            >

              <li>
                <a onClick={() => handleLogout()}>
                  <Plugs size={24} weight="fill" className="text-primary" />{" "}
                  Disconnect
                </a>
              </li>
            </ul>
          </div>
        </div >
      ) : (
        <button
          className="btn btn-outline btn-primary"
          onClick={() => handleConnect()}
        >
          Connect Phantom
        </button>
      )}
    </>
  );
};

export const Header = () => {
  return (
    <div className="bg-white flex h-20  shadow-lg px-6 top-0 right-0 left-0 z-50 gap-2 items-center fixed">
      <Link to="/" className="flex font-bold text-2xl gap-2 items-center">
        Create Token On Solana
      </Link>
      <div className="flex-1"></div>

      <ConnectSolanaButton />
    </div>
  );
};
