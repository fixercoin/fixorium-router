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
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create DCA strategy');
    }

    return response.json();
  }

  async getStrategy(strategyId: number): Promise<DCAStrategy> {
    const response = await fetch(`${this.baseUrl}/dca?strategyId=${strategyId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch strategy');
    }

    const data = await response.json();
    return data.strategy;
  }

  async getAllStrategies(): Promise<DCAStrategy[]> {
    const response = await fetch(`${this.baseUrl}/dca`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch strategies');
    }

    const data = await response.json();
    return data.strategies;
  }

  async withdrawFunds(strategyId: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/dca?strategyId=${strategyId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': this.apiKey }
    });

    return response.ok;
  }
}
