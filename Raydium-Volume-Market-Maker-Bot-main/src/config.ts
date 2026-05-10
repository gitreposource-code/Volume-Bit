import "dotenv/config";
import { z } from "zod";
import type { BotConfig } from "./types.js";

const schema = z.object({
  RPC_URL: z.string().url(),
  PRIVATE_KEY: z.string().min(1),
  TREASURY_PUBLIC_KEY: z.string().optional(),
  DRY_RUN: z.string().optional().default("true"),
  DEFAULT_SLIPPAGE_BPS: z.string().optional().default("100"),
  BUY_AMOUNT_UI: z.string().optional().default("10"),
  SELL_AMOUNT_UI: z.string().optional().default("10"),
  BUY_INTERVAL_MS: z.string().optional().default("12000"),
  SELL_INTERVAL_MS: z.string().optional().default("12000"),
  MAX_POSITION_UI: z.string().optional().default("100000"),
  MIN_BASE_RESERVE_UI: z.string().optional().default("0")
});

export function loadConfig(): BotConfig {
  const raw = schema.parse(process.env);
  return {
    rpcUrl: raw.RPC_URL,
    privateKey: raw.PRIVATE_KEY,
    treasuryPublicKey: raw.TREASURY_PUBLIC_KEY,
    dryRun: raw.DRY_RUN.toLowerCase() === "true",
    defaultSlippageBps: Number(raw.DEFAULT_SLIPPAGE_BPS),
    buyAmountUi: Number(raw.BUY_AMOUNT_UI),
    sellAmountUi: Number(raw.SELL_AMOUNT_UI),
    buyIntervalMs: Number(raw.BUY_INTERVAL_MS),
    sellIntervalMs: Number(raw.SELL_INTERVAL_MS),
    maxPositionUi: Number(raw.MAX_POSITION_UI),
    minBaseReserveUi: Number(raw.MIN_BASE_RESERVE_UI)
  };
}
