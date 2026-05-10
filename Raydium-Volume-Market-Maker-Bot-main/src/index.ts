import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { BotEngine } from "./engine.js";
import { logger } from "./logger.js";
import { loadKeypairFromEnv } from "./wallet.js";
import { createTokenMintAndSupply } from "./token/createToken.js";
import { sweepSol } from "./gather/sweeper.js";
import type { RaydiumPoolKind } from "./types.js";

const program = new Command();
program.name("raydium-mm").description("Raydium market maker bot (safe scaffold)");

program
  .command("create-token")
  .description("Create an SPL token mint and mint initial supply to payer ATA")
  .requiredOption("--decimals <number>", "Token decimals")
  .requiredOption("--initial-supply <number>", "Initial supply in UI units")
  .action(async (opts) => {
    const engine = new BotEngine();
    const cfg = engine.getConfig();
    const payer = loadKeypairFromEnv(cfg.privateKey);
    const res = await createTokenMintAndSupply({
      connection: engine.getConnection(),
      payer,
      decimals: Number(opts.decimals),
      initialSupplyUi: Number(opts.initialSupply)
    });

    logger.info(
      { mint: res.mint.toBase58(), ata: res.ata.toBase58(), signature: res.signature },
      "token created"
    );
  });

program
  .command("run-bot")
  .description("Run market-maker loop on a pool")
  .requiredOption("--pool-id <string>", "Raydium pool id")
  .requiredOption("--kind <kind>", "clmm|cpmm|amm|launchlab")
  .requiredOption("--base-mint <string>", "base mint")
  .requiredOption("--quote-mint <string>", "quote mint")
  .action(async (opts) => {
    const kind = String(opts.kind) as RaydiumPoolKind;
    if (!["clmm", "cpmm", "amm", "launchlab"].includes(kind)) {
      throw new Error(`Invalid pool kind: ${opts.kind}`);
    }

    const engine = new BotEngine();
    engine.start({
      id: String(opts.poolId),
      kind,
      baseMint: String(opts.baseMint),
      quoteMint: String(opts.quoteMint)
    });

    process.on("SIGINT", () => {
      engine.stop();
      process.exit(0);
    });
  });

program
  .command("gather")
  .description("Sweep SOL to treasury wallet")
  .action(async () => {
    const engine = new BotEngine();
    const cfg = engine.getConfig();
    if (!cfg.treasuryPublicKey) {
      throw new Error("TREASURY_PUBLIC_KEY is required for gather.");
    }
    const from = loadKeypairFromEnv(cfg.privateKey);
    const sig = await sweepSol({
      connection: engine.getConnection(),
      from,
      to: new PublicKey(cfg.treasuryPublicKey)
    });
    logger.info({ signature: sig }, "gather complete");
  });

void program.parseAsync(process.argv);
