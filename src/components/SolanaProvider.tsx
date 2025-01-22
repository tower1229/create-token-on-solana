import { useMemo, ReactNode, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { getStore, autorun } from "@/store";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

import { RPCS } from "@/constants";

const ConnectionProviderWithNetwork = ({ children }: { children: ReactNode }) => {
  const { Network } = getStore();
  const [endpoint, setEndpoint] = useState(RPCS[Network.currentNetwork]);

  useEffect(() => {
    const disposer = autorun(() => {
      setEndpoint(RPCS[Network.currentNetwork]);
    });

    return () => disposer();
  }, [Network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {children}
    </ConnectionProvider>
  );
};

export const SolanaProvider = ({ children }: { children: ReactNode }) => {

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ConnectionProviderWithNetwork>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProviderWithNetwork>
  );
};
