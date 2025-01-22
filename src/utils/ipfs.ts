import lighthouse from "@lighthouse-web3/sdk";

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: any[];
}

export async function uploadImageToIPFS(
  file: File,
  apiKey = import.meta.env.PUBLIC_LIGHTHOUSE_API_KEY
): Promise<{ ipfsUrl: string; httpUrl: string }> {
  try {
    const response = await lighthouse.upload([file], apiKey);

    if (!response.data.Hash) {
      throw new Error("Failed to get IPFS hash from upload");
    }

    const ipfsUrl = `ipfs://${response.data.Hash}`;
    const httpUrl = `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`;

    return { ipfsUrl, httpUrl };
  } catch (error) {
    console.error("Failed to upload image to IPFS:", error);
    throw error;
  }
}

export async function uploadMetadataToIPFS(
  metadata: TokenMetadata,
  apiKey = import.meta.env.PUBLIC_LIGHTHOUSE_API_KEY
): Promise<{ ipfsUrl: string; httpUrl: string }> {
  try {
    // 验证必要字段
    if (!metadata.name || !metadata.symbol || !metadata.description) {
      throw new Error("Missing required metadata fields");
    }

    // 准备元数据
    const metadataObject = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: metadata.image,
      external_url: metadata.external_url,
      attributes: metadata.attributes,
    };

    // 将元数据对象转换为Blob
    const metadataBlob = new Blob([JSON.stringify(metadataObject)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json");

    // 上传元数据
    const response = await lighthouse.upload([metadataFile], apiKey);

    if (!response.data.Hash) {
      throw new Error("Failed to get IPFS hash from upload");
    }

    const ipfsUrl = `ipfs://${response.data.Hash}`;
    // 使用 Lighthouse 网关
    const httpUrl = `https://gateway.lighthouse.storage/ipfs/${response.data.Hash}`;
    // 或者使用 IPFS.io 网关
    // const httpUrl = `https://ipfs.io/ipfs/${response.data.Hash}`;

    return { ipfsUrl, httpUrl };
  } catch (error) {
    console.error("Failed to upload metadata to IPFS:", error);
    throw error;
  }
}
