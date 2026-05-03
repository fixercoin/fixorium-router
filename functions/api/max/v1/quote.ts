// functions/api/quote.ts
export interface Env {
  DFLOW_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  // GET /api/quote?input=SOL&output=USDC&amount=0.1
  if (request.method === 'GET') {
    const inputToken = url.searchParams.get('input') || 'SOL';
    const outputToken = url.searchParams.get('output') || 'USDC';
    const amount = parseFloat(url.searchParams.get('amount') || '0.1');
    
    // Token mint addresses
    const tokenMints: Record<string, string> = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    };
    
    const inputMint = tokenMints[inputToken.toUpperCase()] || inputToken;
    const outputMint = tokenMints[outputToken.toUpperCase()] || outputToken;
    
    // Convert amount to lamports (assuming SOL decimals - adjust per token)
    const amountLamports = Math.floor(amount * 1_000_000_000);
    
    // DFlow API call
    const dflowUrl = `https://quote-api.dflow.net/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50&platformFeeBps=1`;
    
    try {
      const dflowResponse = await fetch(dflowUrl, {
        headers: {
          'x-api-key': env.DFLOW_API_KEY,
        },
      });
      
      const quote = await dflowResponse.json();
      
      // Parse outputs (adjust decimals based on token)
      const outAmount = parseFloat(quote.outAmount) / 1_000_000;
      const fee = outAmount * 0.0001; // 0.01%
      const finalOutput = outAmount - fee;
      
      return new Response(JSON.stringify({
        success: true,
        aggregator: 'MAX',
        fee: '0.01%',
        input: {
          token: inputToken,
          amount: amount,
        },
        output: {
          token: outputToken,
          amount: finalOutput,
          quote: outAmount,
        },
        fee_amount: fee,
        mev_protection: true,
        price_impact: parseFloat(quote.priceImpactPct || 0),
        min_output: parseFloat(quote.minOutAmount || 0) / 1_000_000,
        route: quote.routePlan || [],
      }), { headers });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch quote from DFlow',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), { headers, status: 500 });
    }
  }
  
  // Method not allowed
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
    headers, 
    status: 405 
  });
};
