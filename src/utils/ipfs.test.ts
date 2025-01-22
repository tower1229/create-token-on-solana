import { describe, it, expect } from "vitest";
import { uploadMetadataToIPFS, uploadImageToIPFS } from "./ipfs";

describe("uploadMetadataToIPFS", () => {
  it("should successfully upload metadata to IPFS", async () => {
    // Create and upload test image first
    const imageFile = new File(["test image content"], "test.png", {
      type: "image/png",
    });
    const imageUri = (
      await uploadImageToIPFS(
        imageFile,
        "c61746c3.3f5968f19f0147269c7c4f0a2ecc2761"
      )
    ).httpUrl;

    const testMetadata = {
      name: "Test NFT",
      symbol: "TEST",
      description: "Test NFT Description",
      image: imageUri, // Now using the IPFS URI instead of File object
      external_url: "https://example.com",
      attributes: [],
    };

    const result = await uploadMetadataToIPFS(
      testMetadata,
      "c61746c3.3f5968f19f0147269c7c4f0a2ecc2761"
    );
    expect(result).toMatch(/^ipfs:\/\/baf[a-zA-Z0-9]+/);
  });

  it("should throw error when required fields are missing", async () => {
    const invalidMetadata = {
      name: "", // Empty name
      symbol: "TEST",
      description: "Test Description",
      image: "ipfs://test-uri",
      external_url: "https://example.com",
      attributes: [],
    };

    await expect(
      uploadMetadataToIPFS(
        invalidMetadata,
        "c61746c3.3f5968f19f0147269c7c4f0a2ecc2761"
      )
    ).rejects.toThrow("Missing required metadata fields");
  });
});
