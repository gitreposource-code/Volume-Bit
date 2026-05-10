import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair
} from "@solana/web3.js";

export async function sweepSol({
  connection,
  from,
  to,
  keepSol = 0.01
}: {
  connection: Connection;
  from: Keypair;
  to: PublicKey;
  keepSol?: number;
}): Promise<string | null> {
  const balance = await connection.getBalance(from.publicKey);
  const keepLamports = Math.floor(keepSol * LAMPORTS_PER_SOL);
  const sendLamports = balance - keepLamports;
  if (sendLamports <= 0) return null;

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: sendLamports
    })
  );
  return sendAndConfirmTransaction(connection, tx, [from]);
}
