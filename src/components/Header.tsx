import { Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { shortString } from "@/utils";
import { Plugs, Wallet } from "@phosphor-icons/react";
import { getStore, autorun } from "@/store";

const ConnectSolanaButton = function ConnectSolanaButton() {
  const { Channel } = getStore();
  const { connected, publicKey, select, connect, disconnect } = useWallet();
  const [isSelect, toggleSelect] = useState(false);

  const walletAddress = useMemo(
    () => publicKey?.toBase58(),
    [publicKey, connected]
  );

  useEffect(() => {
    if (isSelect) {
      connect()
        .then(() => {
          console.log("connect success");
        })
        .catch((error) => toast.error(error));
    }

    return () => {
      toggleSelect(false);
    };
  }, [isSelect, connect]);

  const handleConnect = () => {
    console.log("handleConnect", connected);
    if (!connected) {
      select(new PhantomWalletAdapter().name);
      toggleSelect(true);
    }
  };

  const handleLogout = () => {
    disconnect();
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
        <div className="dropdown dropdown-hover dropdown-end">
          <button className="my-2 btn-primary btn btn-outline">
            <Wallet size={24} />
            {shortString(walletAddress || "--", 6, 6)}
          </button>
          <ul
            tabIndex={0}
            className="rounded-lg bg-base-100 shadow p-2 w-48 z-[1] dropdown-content menu"
          >
            <li>
              <a onClick={() => handleLogout()}>
                <Plugs size={24} weight="fill" className="text-primary" />{" "}
                Disconnect
              </a>
            </li>
          </ul>
        </div>
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
