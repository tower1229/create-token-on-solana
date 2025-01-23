import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { uploadMetadataToIPFS, uploadImageToIPFS } from "@/utils";
import { Header, ProgressModal, ExplorerInfo } from "@/components";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { createMetadataInstruction, findMetadataPda } from "@/utils";

export const Route = createFileRoute("/create-spl")({
  component: createSplToken,
});

function createSplToken() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [tokenInfo, setTokenInfo] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    totalSupply: "1000000",
    description: "",
    imageFile: null as File | null,
    externalUrl: "",
    disableMinting: false,
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

  const createToken = async () => {
    try {
      setIsLoading(true);
      setLogs([]);
      setSuccessInfo(undefined);

      if (!connected || !publicKey || !signTransaction) {
        toast("请先连接钱包!");
        return;
      }

      if (!tokenInfo.name || !tokenInfo.symbol) {
        toast("代币名称和符号为必填项!");
        return;
      }

      if (tokenInfo.decimals < 0 || tokenInfo.decimals > 9) {
        toast("精度必须在 0-9 之间!");
        return;
      }

      const totalSupplyNumber = Number(tokenInfo.totalSupply);
      if (isNaN(totalSupplyNumber) || totalSupplyNumber <= 0) {
        toast("请输入有效的发行总量!");
        return;
      }

      const totalSupplyWithDecimals =
        totalSupplyNumber * Math.pow(10, tokenInfo.decimals);
      if (totalSupplyWithDecimals > Number.MAX_SAFE_INTEGER) {
        toast("发行总量超出安全范围!");
        return;
      }

      addLog("开始创建代币...");

      addLog("正在创建代币铸造账户...");
      const mintAccount = web3.Keypair.generate();
      const mintRent = await connection.getMinimumBalanceForRentExemption(
        token.MINT_SIZE
      );

      // 获取关联代币账户地址
      const associatedTokenAddress = token.getAssociatedTokenAddressSync(
        mintAccount.publicKey,
        publicKey
      );

      // 合并所有指令到一个交易中
      const transaction = new web3.Transaction();

      // 1. 添加创建代币铸造账户的指令
      transaction.add(
        web3.SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintAccount.publicKey,
          space: token.MINT_SIZE,
          lamports: mintRent,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        token.createInitializeMintInstruction(
          mintAccount.publicKey,
          tokenInfo.decimals,
          publicKey,
          publicKey,
          token.TOKEN_PROGRAM_ID
        )
      );

      // 如果选择禁用增发，添加禁用铸币权限的指令
      if (tokenInfo.disableMinting) {
        transaction.add(
          token.createSetAuthorityInstruction(
            mintAccount.publicKey,
            publicKey,
            token.AuthorityType.MintTokens,
            null
          )
        );
      }

      // 2. 添加创建关联代币账户的指令
      transaction.add(
        token.createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintAccount.publicKey
        )
      );

      // 3. 添加铸造代币的指令
      transaction.add(
        token.createMintToInstruction(
          mintAccount.publicKey,
          associatedTokenAddress,
          publicKey,
          Number(tokenInfo.totalSupply) * 10 ** tokenInfo.decimals
        )
      );

      // 4. 上传元数据到 IPFS
      addLog("正在上传元数据...");
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

      // 5. 添加创建元数据账户的指令
      const metadataData = {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        uri: metadataUrl,
        isMutable: tokenInfo.isMutable,
      };
      const metadataPDA = findMetadataPda(mintAccount.publicKey);
      transaction.add(
        createMetadataInstruction(
          metadataPDA,
          mintAccount.publicKey,
          publicKey,
          publicKey,
          publicKey,
          metadataData
        )
      );

      // 设置交易参数并签名
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.sign(mintAccount);

      const signedTx = await signTransaction(transaction);
      addLog("正在发送交易...");
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(signature, "confirmed");

      addLog("🎉 代币创建完成!");
      setSuccessInfo({
        token: mintAccount.publicKey.toString(),
        tx: signature,
      });
    } catch (error: any) {
      if (error instanceof web3.SendTransactionError) {
        console.error("交易错误详情:", error.logs);
        addLog(`❌ 错误: ${error.message}\n${error.logs?.join("\n")}`);
      } else if (error instanceof Error) {
        console.error("创建代币错误:", error);
        addLog(`❌ 错误: ${error.message}`);
      } else {
        console.error("未知错误:", error);
        addLog("❌ 发生未知错误");
      }
      toast.error("创建代币失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotalSupplyChange = (value: string) => {
    // 只允许输入正整数
    if (!/^\d*$/.test(value)) {
      return;
    }

    // 如果输入的不是空字符串，确保是正整数
    if (value !== "" && parseInt(value) <= 0) {
      return;
    }

    setTokenInfo((prev) => ({ ...prev, totalSupply: value }));
  };

  return (
    <div className="mx-auto min-h-screen max-w-screen-md px-4 pt-20 pb-8">
      <Header />

      <div className="bg-base-200 shadow-xl mt-8 p-8 card">
        <h2 className="font-bold mb-8 text-3xl">创建代币</h2>

        <div className="grid gap-6">
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
              <span className="font-medium label-text">精度</span>
            </label>
            <input
              type="number"
              value={tokenInfo.decimals}
              onChange={(e) =>
                setTokenInfo({ ...tokenInfo, decimals: Number(e.target.value) })
              }
              className="bg-base-100 w-full input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">发行总量</span>
            </label>
            <input
              type="text"
              value={tokenInfo.totalSupply}
              onChange={(e) => handleTotalSupplyChange(e.target.value)}
              className="bg-base-100 w-full input input-bordered"
              placeholder="请输入正整数"
            />
            <label className="label">
              <span className="text-base-content/70 label-text-alt">
                实际发行量:{" "}
                {Number(tokenInfo.totalSupply || 0) *
                  Math.pow(10, tokenInfo.decimals)}
              </span>
            </label>
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
            {tokenInfo.imageFile && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(tokenInfo.imageFile)}
                  alt="Token preview"
                  className="border rounded-lg object-cover border-base-300 h-32 w-32"
                />
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="form-control">
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

          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="font-medium label-text">禁用代币增发</span>
              <input
                type="checkbox"
                checked={tokenInfo.disableMinting}
                onChange={(e) =>
                  setTokenInfo({
                    ...tokenInfo,
                    disableMinting: e.target.checked,
                  })
                }
                className="checkbox"
              />
            </label>
            <label className="label">
              <span className="text-base-content/70 label-text-alt">
                启用后将永久禁用代币增发功能
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="cursor-pointer label">
              <span className="font-medium label-text">允许后续修改</span>
              <input
                type="checkbox"
                checked={tokenInfo.isMutable}
                onChange={(e) =>
                  setTokenInfo({
                    ...tokenInfo,
                    isMutable: e.target.checked,
                  })
                }
                className="checkbox"
              />
            </label>
            <label className="label">
              <span className="text-base-content/70 label-text-alt">
                关闭后将无法再次修改代币元数据
              </span>
            </label>
          </div>

          <button
            onClick={createToken}
            disabled={!connected || isLoading}
            className="mt-4 w-full btn btn-primary"
          >
            {isLoading && <span className="loading loading-spinner"></span>}
            {isLoading ? "创建中..." : "创建代币"}
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
