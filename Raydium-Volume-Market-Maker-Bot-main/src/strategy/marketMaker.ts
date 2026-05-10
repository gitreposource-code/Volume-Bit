import { logger } from "../logger.js";
import { AdapterRegistry } from "../raydium/adapter.js";
import type { BotConfig, PoolRef, TradeRequest } from "../types.js";

type Side = "buy" | "sell";

export class MarketMakerStrategy {
  private buyTimer: NodeJS.Timeout | null = null;
  private sellTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly cfg: BotConfig,
    private readonly adapters: AdapterRegistry,
    private readonly pool: PoolRef
  ) {}

  start(): void {
    this.buyTimer = setInterval(() => void this.tick("buy"), this.cfg.buyIntervalMs);
    this.sellTimer = setInterval(() => void this.tick("sell"), this.cfg.sellIntervalMs);
    logger.info(
      { poolId: this.pool.id, kind: this.pool.kind, dryRun: this.cfg.dryRun },
      "market-maker strategy started"
    );
  }

  stop(): void {
    if (this.buyTimer) clearInterval(this.buyTimer);
    if (this.sellTimer) clearInterval(this.sellTimer);
    this.buyTimer = null;
    this.sellTimer = null;
    logger.info({ poolId: this.pool.id }, "market-maker strategy stopped");
  }

  private async tick(side: Side): Promise<void> {
    const adapter = this.adapters.get(this.pool.kind);
    const position = await this.adapters.getPosition(this.pool);

    if (side === "buy" && position.baseBalanceUi >= this.cfg.maxPositionUi) {
      logger.warn({ position }, "buy skipped by max position guard");
      return;
    }
    if (side === "sell" && position.baseBalanceUi <= this.cfg.minBaseReserveUi) {
      logger.warn({ position }, "sell skipped by min reserve guard");
      return;
    }

    const amountUi = side === "buy" ? this.cfg.buyAmountUi : this.cfg.sellAmountUi;
    const req: TradeRequest = {
      pool: this.pool,
      side,
      amountUi,
      slippageBps: this.cfg.defaultSlippageBps
    };

    try {
      const sig = await adapter.executeSwap(req);
      logger.info({ side, amountUi, sig }, "order executed");
    } catch (err) {
      logger.error({ err, side, amountUi }, "order execution failed");
    }
  }
}
