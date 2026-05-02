export interface DCAParams {
  inputMint: string;
  outputMint: string;
  totalAmount: number;
  amountPerCycle: number;
  cycleSeconds: number;
  totalCycles: number;
}

export interface DCAStrategy {
  strategyId: number;
  inputMint: string;
  outputMint: string;
  totalAmount: number;
  amountPerCycle: number;
  cycleSeconds: number;
  totalCycles: number;
  completedCycles: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'withdrawn';
  nextExecution: Date;
  expectedEnd: Date;
  fee: number;
}

export class MAXDCA {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://fixorium.com.pk/max/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createStrategy(params: DCAParams): Promise<DCAStrategy> {
    const response = await fetch(`${this.baseUrl}/dca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON
