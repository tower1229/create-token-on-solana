import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import {
  uploadMetadataToIPFS,
  uploadImageToIPFS,
  findMetadataPda,
} from "@/utils";
import { Header, ProgressModal, ExplorerInfo } from "@/components";
import {
  UpdateMetadataAccountV2InstructionArgs,
  UpdateMetadataAccountV2InstructionAccounts,
  createUpdateMetadataAccountV2Instruction,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";

export const Route = createFileRoute("/update-spl")({
  component: UpdateSpl,
});

function UpdateSpl() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState({
    name: "",
    symbol: "",
    description: "",
    imageFile: null as File | null,
    imageUrl: "",
    externalUrl: "",
    isMutable: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<ExplorerInfo | undefined>(
    undefined
  );

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const fetchTokenInfo = async (address: string) => {
    try {
      // Validate mint address
      const mint = new web3.PublicKey(address);
      const metadataPDA = findMetadataPda(mint);

      addLog("正在获取代币信息...");
      const metadata = await connection.getAccountInfo(metadataPDA);

      if (!metadata) {
        toast.error("未找到代币元数据账户");
        return;
      }

      const metadataDecoded = Metadata.deserialize(metadata.data)[0];
      const metadataJson = await fetch(metadataDecoded.data.uri);
      const json = await metadataJson.json();

      console.log("Metadata JSON:", json);

      setTokenInfo({
        name: json.name || "",
        symbol: json.symbol || "",
        description: json.description || "",
        imageFile: null,
        imageUrl: json.image || "",
        externalUrl: json.external_url || "",
        isMutable: metadataDecoded.isMutable,
      });

      // 如果有图片，展示在页面上
      if (json.image) {
        setTokenInfo((prev) => ({
          ...prev,
          imageUrl: json.image,
        }));
      }

      addLog("代币信息获取成功!");
    } catch (error) {
      console.error("获取代币信息失败:", error);
      toast.error("获取代币信息失败");
    }
  };

  // Update the mint address input handler
  const handleMintAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setMintAddress(address);

    // Only fetch if address is the correct length
    if (address.length === 44 || address.length === 43) {
      try {
        new web3.PublicKey(address);
        fetchTokenInfo(address);
      } catch {
        // Invalid address format, ignore
      }
    }
  };

  const updateToken = async () => {
    try {
      setIsLoading(true);
      setLogs([]);
      setSuccessInfo(undefined);

      if (!connected || !publicKey || !signTransaction) {
        toast("请先连接钱包!");
        return;
      }

      if (!mintAddress) {
        toast("请输入代币地址!");
        return;
      }

      // 验证 mint address 是否有效
      try {
        new web3.PublicKey(mintAddress);
      } catch {
        toast("无效的代币地址!");
        return;
      }

      if (!tokenInfo.name || !tokenInfo.symbol) {
        toast("代币名称和符号为必填项!");
        return;
      }

      const mint = new web3.PublicKey(mintAddress);
      const metadataPDA = findMetadataPda(mint);

      // 检查更新权限
      addLog("检查更新权限...");
      const metadata = await connection.getAccountInfo(metadataPDA);
      if (!metadata) {
        throw new Error("未找到代币元数据账户");
      }

      addLog("开始更新代币元数据...");

      // 上传新的元数据到 IPFS
      let imageUrl = "";
      if (tokenInfo.imageFile) {
        addLog("正在上传图片到 IPFS...");
        imageUrl = (await uploadImageToIPFS(tokenInfo.imageFile)).httpUrl;
        addLog("图片上传成功!");
      }

      addLog("正在上传元数据到 IPFS...");
      const metadataUrl = (
        await uploadMetadataToIPFS({
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          description: tokenInfo.description,
          image: imageUrl || "",
          external_url: tokenInfo.externalUrl,
          attributes: [],
        })
      ).httpUrl;
      addLog("元数据上传成功!");

      // 创建更新元数据的交易
      const transaction = new web3.Transaction();

      const accounts: UpdateMetadataAccountV2InstructionAccounts = {
        metadata: metadataPDA,
        updateAuthority: publicKey,
      };

      const data: UpdateMetadataAccountV2InstructionArgs = {
        updateMetadataAccountArgsV2: {
          updateAuthority: publicKey,
          primarySaleHappened: null,
          isMutable: tokenInfo.isMutable,
          data: {
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
        },
      };

      transaction.add(createUpdateMetadataAccountV2Instruction(accounts, data));

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      addLog("正在发送交易...");
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        }
      );
      await connection.confirmTransaction(signature, "confirmed");

      addLog("🎉 元数据更新完成!");
      setSuccessInfo({
        token: mintAddress,
        tx: signature,
      });
    } catch (error: any) {
      if (error instanceof web3.SendTransactionError) {
        console.error("交易错误详情:", error.logs);
        addLog(`❌ 错误: ${error.message}\n${error.logs?.join("\n")}`);
      } else if (error.message?.includes("0x1")) {
        addLog("❌ 错误: 您没有更新此代币元数据的权限");
      } else if (error instanceof Error) {
        console.error("更新代币错误:", error);
        addLog(`❌ 错误: ${error.message}`);
      } else {
        console.error("未知错误:", error);
        addLog("❌ 发生未知错误");
      }
      toast.error("更新代币失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-screen-md px-4 pt-20 pb-8">
      <Header />

      <div className="bg-base-200 shadow-xl mt-8 p-8 card">
        <h2 className="font-bold mb-8 text-3xl">更新代币</h2>

        <div className="grid gap-6">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币地址</span>
            </label>
            <input
              type="text"
              value={mintAddress}
              onChange={handleMintAddressChange}
              className="bg-base-100 w-full input input-bordered"
              placeholder="输入代币地址..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币名称</span>
            </label>
            <input
              type="text"
              value={tokenInfo.name}
              onChange={(e) =>
                setTokenInfo({ ...tokenInfo, name: e.target.value })
              }
              className="bg-base-100 w-full input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币符号</span>
            </label>
            <input
              type="text"
              value={tokenInfo.symbol}
              onChange={(e) =>
                setTokenInfo({ ...tokenInfo, symbol: e.target.value })
              }
              className="bg-base-100 w-full input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币描述</span>
            </label>
            <textarea
              value={tokenInfo.description}
              onChange={(e) =>
                setTokenInfo({ ...tokenInfo, description: e.target.value })
              }
              className="bg-base-100 w-full textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">代币图片</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setTokenInfo((prev) => ({
                    ...prev,
                    imageFile: file,
                  }));
                }
              }}
              className="bg-base-100 w-full file-input file-input-bordered"
            />
            {(tokenInfo.imageFile || tokenInfo.imageUrl) && (
              <div className="mt-4">
                <img
                  src={
                    tokenInfo.imageFile
                      ? URL.createObjectURL(tokenInfo.imageFile)
                      : tokenInfo.imageUrl
                  }
                  alt="Token preview"
                  className="border rounded-lg object-cover border-base-300 h-32 w-32"
                />
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">外部链接</span>
            </label>
            <input
              type="text"
              value={tokenInfo.externalUrl}
              onChange={(e) =>
                setTokenInfo({ ...tokenInfo, externalUrl: e.target.value })
              }
              className="bg-base-100 w-full input input-bordered"
              placeholder="https://..."
            />
          </div>

          <button
            onClick={updateToken}
            disabled={!connected || isLoading}
            className="mt-4 w-full btn btn-primary"
          >
            {isLoading && <span className="loading loading-spinner"></span>}
            {isLoading ? "更新中..." : "更新代币"}
          </button>
        </div>
      </div>

      {/* 进度日志展示 */}
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
