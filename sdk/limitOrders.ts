import { Connection, PublicKey } from '@solana/web3.js';

export interface LimitOrderParams {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  triggerPrice: number;
  expiryDays?: number;
}

export interface LimitOrder {
  orderId: number;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  triggerPrice: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  filledAmount: number;
  fee: number;
}

export class MAXLimitOrders {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://fixorium.com.pk/max/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createOrder(params: LimitOrderParams): Promise<LimitOrder> {
    const response = await fetch(`${this.baseUrl}/limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        inputAmount: params.inputAmount,
        triggerPrice: params.triggerPrice,
        expiryDays: params.expiryDays || 7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create limit order');
    }

    return response.json();
  }

  async getOrder(orderId: number): Promise<LimitOrder> {
    const response = await fetch(`${this.baseUrl}/limit?orderId=${orderId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const data = await response.json();
    return data.order;
  }

  async getAllOrders(): Promise<LimitOrder[]> {
    const response = await fetch(`${this.baseUrl}/limit`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data.orders;
  }

  async cancelOrder(orderId: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/limit?orderId=${orderId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': this.apiKey }
    });

    return response.ok;
  }
}
