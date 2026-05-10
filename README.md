# Raydium-Volume-Market-Maker

TypeScript scaffold for a Solana Raydium market-making bot with:

- SPL token creation command
- Strategy loop with configurable buy/sell amount and speed
- Adapter architecture for Raydium `CLMM`, `CPMM`, `AMM`, and `LaunchLab`
- Gather command to sweep SOL to treasury
- Dry-run mode for safe testing

## Install

```bash
npm install
```

## Environment

Create `.env` in project root:

```bash
RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=[1,2,3,...]
TREASURY_PUBLIC_KEY=
DRY_RUN=true
DEFAULT_SLIPPAGE_BPS=100
BUY_AMOUNT_UI=10
SELL_AMOUNT_UI=10
BUY_INTERVAL_MS=12000
SELL_INTERVAL_MS=12000
MAX_POSITION_UI=100000
MIN_BASE_RESERVE_UI=0
```

## Commands

Create token:

```bash
npm run dev -- create-token --decimals 6 --initial-supply 1000000
```

Run bot:

```bash
npm run dev -- run-bot --pool-id <POOL_ID> --kind clmm --base-mint <BASE_MINT> --quote-mint <QUOTE_MINT>
```

Gather:

```bash
npm run dev -- gather
```

## Notes

- `DRY_RUN=true` returns simulated swap signatures.
- Swap execution and pool pricing in adapters are scaffolds; wire the Raydium SDK/API in `src/raydium/adapter.ts` for live trading.
- Use only in markets where your activity complies with local laws and exchange rules.
