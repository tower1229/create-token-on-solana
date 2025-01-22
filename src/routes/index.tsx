import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { uploadMetadataToIPFS, uploadImageToIPFS } from "@/utils";
import { Header, ProgressModal } from "@/components";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { createMetadataInstruction, findMetadataPda } from "@/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const createToken = async () => {
    try {
      setIsLoading(true);
      setLogs([]);

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

      // 2. 创建初始化代币铸造账户的交易
      const mintTransaction = new web3.Transaction().add(
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

      // 3. 设置交易的 feePayer 和 recentBlockhash
      mintTransaction.feePayer = publicKey;
      mintTransaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      // 4. 先由 mintAccount 签名
      mintTransaction.sign(mintAccount);

      // 5. 然后由用户钱包签名
      const signedTx = await signTransaction(mintTransaction);

      // 6. 发送并确认交易
      const mintTxSignature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(mintTxSignature);

      addLog(`代币铸造账户创建成功: ${mintAccount.publicKey.toString()}`);

      addLog("正在创建代币账户...");
      const associatedTokenAddress = token.getAssociatedTokenAddressSync(
        mintAccount.publicKey,
        publicKey
      );

      const createAccountInstruction =
        token.createAssociatedTokenAccountInstruction(
          publicKey, // payer
          associatedTokenAddress, // associated token account
          publicKey, // owner
          mintAccount.publicKey // mint
        );

      const createAccountTransaction = new web3.Transaction().add(
        createAccountInstruction
      );
      createAccountTransaction.feePayer = publicKey;
      createAccountTransaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedCreateAccountTx = await signTransaction(
        createAccountTransaction
      );
      const createAccountSignature = await connection.sendRawTransaction(
        signedCreateAccountTx.serialize()
      );
      await connection.confirmTransaction(createAccountSignature, "confirmed");

      addLog("代币账户创建成功!");

      addLog("正在铸造代币...");
      const mintToInstruction = token.createMintToInstruction(
        mintAccount.publicKey,
        associatedTokenAddress,
        publicKey,
        Number(tokenInfo.totalSupply) * 10 ** tokenInfo.decimals
      );

      const mintToTransaction = new web3.Transaction().add(mintToInstruction);
      mintToTransaction.feePayer = publicKey;
      mintToTransaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedMintToTx = await signTransaction(mintToTransaction);
      const mintToSignature = await connection.sendRawTransaction(
        signedMintToTx.serialize()
      );
      await connection.confirmTransaction(mintToSignature);

      addLog(`成功铸造 ${tokenInfo.totalSupply} 个代币!`);

      addLog("正在上传元数据...");
      // 上传图片和元数据到 IPFS（如果有图片）
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
          image: imageUrl || "", // 如果没有图片，使用空字符串
          external_url: tokenInfo.externalUrl,
          attributes: [],
        })
      ).httpUrl;
      addLog("元数据上传成功!");

      // 5. 创建元数据
      const metadataData = {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        uri: metadataUrl,
      };

      // 6. 获取元数据 PDA
      const metadataPDA = findMetadataPda(mintAccount.publicKey);
      // 7. 创建元数据指令并执行
      addLog("正在创建代币元数据账户...");
      const transaction = new web3.Transaction().add(
        createMetadataInstruction(
          metadataPDA,
          mintAccount.publicKey,
          publicKey,
          publicKey,
          publicKey,
          metadataData
        )
      );
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const signedMetadataTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedMetadataTx.serialize()
      );
      await connection.confirmTransaction(signature, "confirmed");

      addLog("代币元数据创建成功!");
      addLog("🎉 代币创建完成!");
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

  return (
    <div className="mx-auto max-w-screen-md p-4 pt-24">
      <Header />

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

        <div>
          <label className="mb-1 block">代币描述</label>
          <textarea
            value={tokenInfo.description}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, description: e.target.value })
            }
            className="border rounded w-full p-2"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block">代币图片</label>
          <div className="flex flex-col gap-2">
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
              className="border rounded w-full p-2"
            />
            {tokenInfo.imageFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(tokenInfo.imageFile)}
                  alt="Token preview"
                  className="rounded object-cover h-32 w-32"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block">外部链接</label>
          <input
            type="text"
            value={tokenInfo.externalUrl}
            onChange={(e) =>
              setTokenInfo({ ...tokenInfo, externalUrl: e.target.value })
            }
            className="border rounded w-full p-2"
            placeholder="https://..."
          />
        </div>

        <button
          onClick={createToken}
          disabled={!connected || isLoading}
          className="rounded flex bg-green-500 text-white py-2 px-4 gap-2 items-center disabled:opacity-50"
        >
          {isLoading && (
            <div className="border-white border-t-transparent rounded-full border-2 h-4 animate-spin w-4" />
          )}
          {isLoading ? "创建中..." : "创建代币"}
        </button>

        {/* 进度日志展示 */}
        <ProgressModal open={logs.length > 0} logs={logs} />
      </div>
    </div>
  );
}
