import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

// Constants
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const LIMIT_ORDERS_PROGRAM_ID = new PublicKey(process.env.LIMIT_ORDERS_PROGRAM_ID!);
const DCA_PROGRAM_ID = new PublicKey(process.env.DCA_PROGRAM_ID!);
const CHECK_INTERVAL_MS = 10000; // 10 seconds

interface OrderState {
  owner: PublicKey;
  orderId: bigint;
  inputMint: PublicKey;
  outputMint: PublicKey;
  inputAmount: bigint;
  triggerPrice: bigint;
  filledAmount: bigint;
  status: number;
  createdAt: bigint;
  expiry: bigint;
  feePaid: bigint;
}

interface DCAStrategy {
  owner: PublicKey;
  strategyId: bigint;
  inputMint: PublicKey;
  outputMint: PublicKey;
  totalAmount: bigint;
  remainingAmount: bigint;
  amountPerCycle: bigint;
  cycleSeconds: bigint;
  totalCycles: bigint;
  completedCycles: bigint;
  lastExecution: bigint;
  nextExecution: bigint;
  status: number;
  feePaid: bigint;
}

class MAXKeeper {
  private connection: Connection;
  private limitOrdersProgram: Program;
  private dcaProgram: Program;
  private keeperWallet: Keypair;

  constructor() {
    this.connection = new Connection(RPC_URL);
    this.keeperWallet = this.loadKeeperWallet();
    const provider = new AnchorProvider(this.connection, this.keeperWallet, {});
    this.limitOrdersProgram = new Program(LIMIT_ORDERS_PROGRAM_ID as any, provider);
    this.dcaProgram = new Program(DCA_PROGRAM_ID as any, provider);
  }

  private loadKeeperWallet(): Keypair {
    const keypairPath = process.env.KEEPER_KEYPAIR_PATH || './keeper-keypair.json';
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return Keypair.fromSecretKey(Buffer.from(keypairData));
  }

  async start() {
    console.log('🚀 MAX Keeper started');
    console.log(`   Limit Orders Program: ${LIMIT_ORDERS_PROGRAM_ID.toString()}`);
    console.log(`   DCA Program: ${DCA_PROGRAM_ID.toString()}`);
    console.log(`   Keeper Wallet: ${this.keeperWallet.publicKey.toString()}`);
    console.log(`   Check Interval: ${CHECK_INTERVAL_MS}ms\n`);

    setInterval(async () => {
      await this.checkLimitOrders();
      await this.checkDCAStrategies();
    }, CHECK_INTERVAL_MS);
  }

  private async getTokenPrice(inputMint: string, outputMint: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.jup.ag/price/v2?ids=${inputMint}&vsToken=${outputMint}`
      );
      const data = await response.json();
      return parseFloat(data.data[inputMint]?.price || '0');
    } catch (error) {
      console.error('Failed to fetch price:', error);
      return 0;
    }
  }

  private async checkLimitOrders() {
    try {
      const orders = await this.limitOrdersProgram.account.orderState.all();
      const activeOrders = orders.filter(
        (o: any) => o.account.status === 0 // STATUS_ACTIVE
      );

      for (const order of activeOrders) {
        const orderData = order.account as OrderState;
        const now = Math.floor(Date.now() / 1000);

        // Check expiry
        if (now > Number(orderData.expiry)) {
          console.log(`⏰ Order ${orderData.orderId} expired, cancelling...`);
          await this.cancelLimitOrder(orderData.orderId);
          continue;
        }

        // Get current price
        const currentPrice = await this.getTokenPrice(
          orderData.inputMint.toString(),
          orderData.outputMint.toString()
        );

        const triggerPrice = Number(orderData.triggerPrice) / 1_000_000; // Convert from basis points

        if (currentPrice <= triggerPrice && currentPrice > 0) {
          console.log(`✅ Executing limit order ${orderData.orderId}`);
          console.log(`   Trigger price: ${triggerPrice}, Current: ${currentPrice}`);
          await this.executeLimitOrder(orderData.orderId, currentPrice);
        }
      }
    } catch (error) {
      console.error('Error checking limit orders:', error);
    }
  }

  private async executeLimitOrder(orderId: bigint, currentPrice: number) {
    try {
      const tx = await this.limitOrdersProgram.methods
        .executeOrder(orderId, Math.floor(currentPrice * 1_000_000))
        .rpc();
      console.log(`   Transaction: ${tx}`);
    } catch (error) {
      console.error(`   Failed to execute order ${orderId}:`, error);
    }
  }

  private async cancelLimitOrder(orderId: bigint) {
    try {
      const tx = await this.limitOrdersProgram.methods
        .cancelOrder(orderId)
        .rpc();
      console.log(`   Cancelled: ${tx}`);
    } catch (error) {
      console.error(`   Failed to cancel order ${orderId}:`, error);
    }
  }

  private async checkDCAStrategies() {
    try {
      const strategies = await this.dcaProgram.account.dcaStrategy.all();
      const activeStrategies = strategies.filter(
        (s: any) => s.account.status === 0 // STATUS_ACTIVE
      );

      for (const strategy of activeStrategies) {
        const strategyData = strategy.account as DCAStrategy;
        const now = Math.floor(Date.now() / 1000);

        if (now >= Number(strategyData.nextExecution)) {
          console.log(`🔄 Executing DCA cycle for strategy ${strategyData.strategyId}`);
          await this.executeDCACycle(strategyData.strategyId);
        }
      }
    } catch (error) {
      console.error('Error checking DCA strategies:', error);
    }
  }

  private async executeDCACycle(strategyId: bigint) {
    try {
      const tx = await this.dcaProgram.methods
        .executeCycle(strategyId)
        .rpc();
      console.log(`   Transaction: ${tx}`);
    } catch (error) {
      console.error(`   Failed to execute DCA cycle ${strategyId}:`, error);
    }
  }
}

// Start the keeper
const keeper = new MAXKeeper();
keeper.start().catch(console.error);
