import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { Header, ProgressModal, ExplorerInfo } from "@/components";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/mint-spl")({
  component: MintSplToken,
});

function MintSplToken() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [mintInfo, setMintInfo] = useState({
    mintAddress: "",
    amount: "",
    decimals: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<ExplorerInfo | undefined>(
    undefined
  );

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const handleMintAddress = async (address: string) => {
    setMintInfo((prev) => ({ ...prev, mintAddress: address }));
    if (web3.PublicKey.isOnCurve(address)) {
      try {
        const mintAccount = new web3.PublicKey(address);
        const mintInfo = await token.getMint(connection, mintAccount);
        setMintInfo((prev) => ({ ...prev, decimals: mintInfo.decimals }));
      } catch (error) {
        console.error("获取代币信息失败:", error);
      }
    }
  };

  const mintTokens = async () => {
    try {
      setIsLoading(true);
      setLogs([]);
      setSuccessInfo(undefined);

      if (!connected || !publicKey || !signTransaction) {
        toast("请先连接钱包!");
        return;
      }

      if (!mintInfo.mintAddress || !mintInfo.amount) {
        toast("请填写完整信息!");
        return;
      }

      const amount = Number(mintInfo.amount);
      if (isNaN(amount) || amount <= 0) {
        toast("请输入有效的增发数量!");
        return;
      }

      addLog("开始增发代币...");

      const mintPubkey = new web3.PublicKey(mintInfo.mintAddress);

      // 获取接收代币的账户地址
      const associatedTokenAddress = token.getAssociatedTokenAddressSync(
        mintPubkey,
        publicKey
      );

      // 检查代币账户是否存在
      const accountInfo = await connection.getAccountInfo(
        associatedTokenAddress
      );

      const transaction = new web3.Transaction();

      // 如果代币账户不存在，先创建账户
      if (!accountInfo) {
        addLog("创建代币账户...");
        transaction.add(
          token.createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            publicKey,
            mintPubkey
          )
        );
      }

      // 添加增发指令
      const realAmount = amount * Math.pow(10, mintInfo.decimals);
      transaction.add(
        token.createMintToInstruction(
          mintPubkey,
          associatedTokenAddress,
          publicKey,
          realAmount
        )
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedTx = await signTransaction(transaction);
      addLog("正在发送交易...");
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(signature, "confirmed");

      addLog("🎉 代币增发完成!");
      setSuccessInfo({
        token: mintInfo.mintAddress,
        tx: signature,
      });
    } catch (error: any) {
      if (error instanceof web3.SendTransactionError) {
        console.error("交易错误详情:", error.logs);
        addLog(`❌ 错误: ${error.message}\n${error.logs?.join("\n")}`);
      } else if (error instanceof Error) {
        console.error("增发代币错误:", error);
        addLog(`❌ 错误: ${error.message}`);
      } else {
        console.error("未知错误:", error);
        addLog("❌ 发生未知错误");
      }
      toast.error("增发代币失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-screen-md px-4 pt-20 pb-8">
      <Header />

      <div className="bg-base-200 shadow-xl mt-8 p-8 card">
        <h2 className="font-bold mb-8 text-3xl">增发代币</h2>

        <div className="grid gap-6">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币地址</span>
            </label>
            <input
              type="text"
              value={mintInfo.mintAddress}
              onChange={(e) => handleMintAddress(e.target.value)}
              className="bg-base-100 w-full input input-bordered"
              placeholder="输入代币地址..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">增发数量</span>
            </label>
            <input
              type="text"
              value={mintInfo.amount}
              onChange={(e) =>
                setMintInfo({ ...mintInfo, amount: e.target.value })
              }
              className="bg-base-100 w-full input input-bordered"
              placeholder="请输入增发数量"
            />
            {mintInfo.decimals > 0 && (
              <label className="label">
                <span className="text-base-content/70 label-text-alt">
                  实际增发量:{" "}
                  {Number(mintInfo.amount || 0) *
                    Math.pow(10, mintInfo.decimals)}
                </span>
              </label>
            )}
          </div>

          <button
            onClick={mintTokens}
            disabled={!connected || isLoading}
            className="mt-4 w-full btn btn-primary"
          >
            {isLoading && <span className="loading loading-spinner"></span>}
            {isLoading ? "增发中..." : "增发代币"}
          </button>
        </div>
      </div>

      <ProgressModal
        open={logs.length > 0}
        logs={logs}
        successInfo={successInfo}
        onClose={() => {
          setLogs([]);
          setSuccessInfo(undefined);
        }}
      />
    </div>
  );
}
