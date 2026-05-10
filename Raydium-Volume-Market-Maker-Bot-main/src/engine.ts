import { Connection } from "@solana/web3.js";
import { loadConfig } from "./config.js";
import { logger } from "./logger.js";
import { AdapterRegistry } from "./raydium/adapter.js";
import { MarketMakerStrategy } from "./strategy/marketMaker.js";
import type { PoolRef } from "./types.js";

export class BotEngine {
  private readonly cfg = loadConfig();
  private readonly connection = new Connection(this.cfg.rpcUrl, "confirmed");
  private readonly adapters = new AdapterRegistry({ dryRun: this.cfg.dryRun });
  private strategy: MarketMakerStrategy | null = null;

  start(pool: PoolRef): void {
    this.strategy = new MarketMakerStrategy(this.cfg, this.adapters, pool);
    this.strategy.start();
    logger.info({ pool, rpcUrl: this.cfg.rpcUrl }, "bot engine started");
  }

  stop(): void {
    this.strategy?.stop();
    this.strategy = null;
    logger.info("bot engine stopped");
  }

  getConnection(): Connection {
    return this.connection;
  }

  getConfig() {
    return this.cfg;
  }
}
