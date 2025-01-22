import * as web3 from "@solana/web3.js";
import {
  createCreateMetadataAccountV3Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";

export const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints?: number;
  creators?: null;
  collection?: null;
  uses?: null;
}

export function createMetadataInstruction(
  metadataPDA: web3.PublicKey,
  mint: web3.PublicKey,
  mintAuthority: web3.PublicKey,
  payer: web3.PublicKey,
  updateAuthority: web3.PublicKey,
  metadata: TokenMetadata
): web3.TransactionInstruction {
  const data: DataV2 = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 0,
    creators: null,
    collection: null,
    uses: null,
  };

  return createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint,
      mintAuthority,
      payer,
      updateAuthority,
    },
    {
      createMetadataAccountArgsV3: {
        data,
        isMutable: true,
        collectionDetails: null,
      },
    }
  );
}

export function findMetadataPda(mint: web3.PublicKey): web3.PublicKey {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}
