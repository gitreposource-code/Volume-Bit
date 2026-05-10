import type {
  PoolRef,
  PositionState,
  PriceSnapshot,
  RaydiumPoolKind,
  TradeRequest
} from "../types.js";

export interface RaydiumAdapter {
  readonly kind: RaydiumPoolKind;
  getPrice(pool: PoolRef): Promise<PriceSnapshot>;
  executeSwap(req: TradeRequest): Promise<string>;
}

export interface AdapterContext {
  dryRun: boolean;
}

abstract class BaseAdapter implements RaydiumAdapter {
  constructor(public readonly kind: RaydiumPoolKind, protected ctx: AdapterContext) {}

  async getPrice(_pool: PoolRef): Promise<PriceSnapshot> {
    // Placeholder until SDK/API pool reads are wired in.
    return { midPrice: 0, ts: Date.now() };
  }

  async executeSwap(req: TradeRequest): Promise<string> {
    if (this.ctx.dryRun) {
      return `dryrun:${this.kind}:${req.pool.id}:${req.side}:${req.amountUi}`;
    }
    throw new Error(`Swap execution for ${this.kind} is not wired yet.`);
  }
}

export class ClmmAdapter extends BaseAdapter {
  constructor(ctx: AdapterContext) {
    super("clmm", ctx);
  }
}

export class CpmmAdapter extends BaseAdapter {
  constructor(ctx: AdapterContext) {
    super("cpmm", ctx);
  }
}

export class AmmAdapter extends BaseAdapter {
  constructor(ctx: AdapterContext) {
    super("amm", ctx);
  }
}

export class LaunchLabAdapter extends BaseAdapter {
  constructor(ctx: AdapterContext) {
    super("launchlab", ctx);
  }
}

export class AdapterRegistry {
  private readonly adapters: Map<RaydiumPoolKind, RaydiumAdapter>;

  constructor(ctx: AdapterContext) {
    this.adapters = new Map<RaydiumPoolKind, RaydiumAdapter>([
      ["clmm", new ClmmAdapter(ctx)],
      ["cpmm", new CpmmAdapter(ctx)],
      ["amm", new AmmAdapter(ctx)],
      ["launchlab", new LaunchLabAdapter(ctx)]
    ]);
  }

  get(kind: RaydiumPoolKind): RaydiumAdapter {
    const adapter = this.adapters.get(kind);
    if (!adapter) throw new Error(`Unsupported pool kind: ${kind}`);
    return adapter;
  }

  // Placeholder inventory source; replace with ATA/margin account reads.
  async getPosition(_pool: PoolRef): Promise<PositionState> {
    return { baseBalanceUi: 0, quoteBalanceUi: 0 };
  }
}
