// functions/api/quote.ts
export interface Env {
  DFLOW_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  if (request.method === 'GET') {
    const inputToken = url.searchParams.get('input') || 'SOL';
    const outputToken = url.searchParams.get('output') || 'USDC';
    const amount = parseFloat(url.searchParams.get('amount') || '1');
    
    const tokenMints: Record<string, string> = {
      'SOL': 'So11111111111111111111111111111111111111112',
      'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    };
    
    const inputMint = tokenMints[inputToken.toUpperCase()] || inputToken;
    const outputMint = tokenMints[outputToken.toUpperCase()] || outputToken;
    const amountLamports = Math.floor(amount * 1_000_000_000);
    
    // Try Jupiter as fallback (always works)
    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=100`;
    
    try {
      // First try DFlow
      let quote = null;
      let source = 'DFlow';
      
      if (env.DFLOW_API_KEY && env.DFLOW_API_KEY !== 'your-dflow-api-key-here') {
        const dflowUrl = `https://quote-api.dflow.net/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50&platformFeeBps=1`;
        
        const dflowResponse = await fetch(dflowUrl, {
          headers: { 'x-api-key': env.DFLOW_API_KEY },
        });
        
        const dflowData = await dflowResponse.json();
        
        if (dflowData.outAmount && parseFloat(dflowData.outAmount) > 0) {
          quote = dflowData;
          source = 'DFlow';
        }
      }
      
      // Fallback to Jupiter if DFlow fails
      if (!quote) {
        const jupiterResponse = await fetch(jupiterUrl);
        quote = await jupiterResponse.json();
        source = 'Jupiter (fallback)';
      }
      
      const outAmount = parseFloat(quote.outAmount) / 1_000_000;
      const fee = outAmount * 0.0001;
      const finalOutput = outAmount - fee;
      
      return new Response(JSON.stringify({
        success: true,
        source: source,
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
        price_impact: parseFloat(quote.priceImpactPct || 0),
        min_output: parseFloat(quote.minOutAmount || 0) / 1_000_000,
      }), { headers });
      
    } catch (error) {
      // Ultimate fallback: simulated quote for demo
      const mockRate = inputToken === 'SOL' && outputToken === 'USDC' ? 180 : 1;
      const outAmount = amount * mockRate;
      const fee = outAmount * 0.0001;
      
      return new Response(JSON.stringify({
        success: true,
        source: 'MAX Demo (fallback)',
        aggregator: 'MAX',
        fee: '0.01%',
        warning: 'Using simulated price - DFlow API key may need verification',
        input: { token: inputToken, amount: amount },
        output: { token: outputToken, amount: outAmount - fee, quote: outAmount },
        fee_amount: fee,
      }), { headers });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
    headers, 
    status: 405 
  });
};
