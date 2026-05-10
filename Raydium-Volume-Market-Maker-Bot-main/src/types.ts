export type RaydiumPoolKind = "clmm" | "cpmm" | "amm" | "launchlab";

export interface BotConfig {
  rpcUrl: string;
  privateKey: string;
  treasuryPublicKey?: string;
  dryRun: boolean;
  defaultSlippageBps: number;
  buyAmountUi: number;
  sellAmountUi: number;
  buyIntervalMs: number;
  sellIntervalMs: number;
  maxPositionUi: number;
  minBaseReserveUi: number;
}

export interface PoolRef {
  id: string;
  kind: RaydiumPoolKind;
  baseMint: string;
  quoteMint: string;
}

export interface TradeRequest {
  pool: PoolRef;
  side: "buy" | "sell";
  amountUi: number;
  slippageBps: number;
}

export interface PriceSnapshot {
  midPrice: number;
  bid?: number;
  ask?: number;
  ts: number;
}

export interface PositionState {
  baseBalanceUi: number;
  quoteBalanceUi: number;
}
