import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
  Transaction
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE
} from "@solana/spl-token";

export interface CreateTokenInput {
  connection: Connection;
  payer: Keypair;
  mintAuthority?: PublicKey;
  freezeAuthority?: PublicKey | null;
  decimals: number;
  initialSupplyUi: number;
}

export async function createTokenMintAndSupply(input: CreateTokenInput): Promise<{
  mint: PublicKey;
  ata: PublicKey;
  signature: string;
}> {
  const mint = Keypair.generate();
  const mintAuthority = input.mintAuthority ?? input.payer.publicKey;
  const freezeAuthority = input.freezeAuthority ?? input.payer.publicKey;
  const ata = getAssociatedTokenAddressSync(mint.publicKey, input.payer.publicKey);
  const lamports = await getMinimumBalanceForRentExemptMint(input.connection);
  const amount = BigInt(
    Math.floor(input.initialSupplyUi * 10 ** input.decimals)
  );

  const tx = new Transaction();
  tx.add(
    // Create mint account.
    SystemProgram.createAccount({
      fromPubkey: input.payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      input.decimals,
      mintAuthority,
      freezeAuthority
    ),
    createAssociatedTokenAccountInstruction(
      input.payer.publicKey,
      ata,
      input.payer.publicKey,
      mint.publicKey
    ),
    createMintToInstruction(
      mint.publicKey,
      ata,
      mintAuthority,
      amount
    )
  );

  const signature = await sendAndConfirmTransaction(input.connection, tx, [
    input.payer,
    mint
  ]);

  return { mint: mint.publicKey, ata, signature };
}
