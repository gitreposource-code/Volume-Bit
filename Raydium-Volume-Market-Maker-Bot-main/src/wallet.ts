import { Keypair } from "@solana/web3.js";

function parseKeyBytes(input: string): Uint8Array {
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    return Uint8Array.from(JSON.parse(trimmed) as number[]);
  }

  // Base58 parsing is intentionally not included to avoid extra dependencies.
  // Use JSON byte-array format in PRIVATE_KEY.
  throw new Error("PRIVATE_KEY must be a JSON array string (e.g. [1,2,3,...]).");
}

export function loadKeypairFromEnv(privateKey: string): Keypair {
  const bytes = parseKeyBytes(privateKey);
  return Keypair.fromSecretKey(bytes);
}
