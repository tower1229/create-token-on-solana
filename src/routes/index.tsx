import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [wallet, setWallet] = useState<any>(null);
  const [tokenInfo, setTokenInfo] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    totalSupply: "1000000",
  });
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const phantom = window.solana;
      if (phantom?.isPhantom) {
        const response = await phantom.connect();
        setWallet(response.publicKey);
        setStatus("钱包已连接");
      } else {
        alert("请安装 Phantom 钱包!");
      }
    } catch (error) {
      console.error("连接错误:", error);
      setStatus("连接失败");
    }
  };

  const createToken = async () => {
    try {
      if (!wallet) {
        alert("请先连接钱包!");
        return;
      }

      setStatus("正在创建代币...");
      // @ts-ignore
      const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

      const mintAccount = web3.Keypair.generate();

      const createTokenTx = await token.createMint(
        connection,
        wallet,
        wallet,
        wallet,
        tokenInfo.decimals,
        mintAccount
      );

      // 创建代币账户
      const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintAccount.publicKey,
        wallet
      );

      // 铸造代币
      await token.mintTo(
        connection,
        wallet,
        mintAccount.publicKey,
        tokenAccount.address,
        wallet,
        Number(tokenInfo.totalSupply) * 10 ** tokenInfo.decimals
      );

      setStatus(`代币创建成功! 代币地址: ${mintAccount.publicKey.toString()}`);
    } catch (error) {
      console.error("创建代币错误:", error);
      setStatus("创建代币失败");
    }
  };

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4 text-2xl">Solana 代币创建工具</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="rounded bg-purple-500 text-white py-2 px-4"
        >
          连接 Phantom 钱包
        </button>
      ) : (
        <div className="mb-4">
          <p>钱包地址: {wallet.toString()}</p>
        </div>
      )}

      <div className="space-y-4 mt-4">
        <div>
          <label className="mb-1 block">代币名称</label>
          <input
            type="text"
            value={tokenInfo.name}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, name: e.target.value })
            }
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="mb-1 block">代币符号</label>
          <input
            type="text"
            value={tokenInfo.symbol}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, symbol: e.target.value })
            }
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="mb-1 block">精度</label>
          <input
            type="number"
            value={tokenInfo.decimals}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, decimals: Number(e.target.value) })
            }
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="mb-1 block">发行总量</label>
          <input
            type="text"
            value={tokenInfo.totalSupply}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, totalSupply: e.target.value })
            }
            className="border rounded w-full p-2"
          />
        </div>

        <button
          onClick={createToken}
          disabled={!wallet}
          className="rounded bg-green-500 text-white py-2 px-4 disabled:opacity-50"
        >
          创建代币
        </button>

        {status && <div className="rounded bg-gray-100 mt-4 p-4">{status}</div>}
      </div>
    </div>
  );
}
