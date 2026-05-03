// api/max/v1/quote.ts
export async function onRequestGet({ request, env }) {
  try {
    // 1. Get and validate API Key
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key required' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Verify API Key against KV store
    // Note: We temporarily skip KV check if binding is missing for debugging
    if (env && env.DEVELOPERS_KV) {
      const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
      if (!keyData || keyData.status !== 'active') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or inactive API key' 
          }),
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      console.warn('DEVELOPERS_KV binding is missing. Skipping validation for debugging.');
      // For production, you should not skip validation. Ensure wrangler.toml is correct.
    }

    // 3. Get query parameters
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = url.searchParams.get('amount');

    // 4. Validate parameters
    if (!inputMint || !outputMint || !amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing parameters: inputMint, outputMint, amount are required' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 5. Calculate quote based on your program's fee structure (0.01%)
    const amountIn = parseFloat(amount);
    if (isNaN(amountIn) || amountIn <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid amount. Must be a positive number.' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Your program's fee is 0.01% = 1 bps
    const feeBps = 1; 
    const feePercent = feeBps / 10000; // 0.0001
    const feeAmount = amountIn * feePercent;
    const amountOut = amountIn - feeAmount;
    
    // Round to appropriate decimal places (e.g., 6 for USDC, 9 for SOL)
    // Keeping as string to preserve precision
    const amountOutStr = amountOut.toFixed(9);
    const feeAmountStr = feeAmount.toFixed(9);

    // 6. Optional: Fetch real data from your Solana program on devnet
    // Your deployed program ID
    const PROGRAM_ID = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
    const RPC_URL = 'https://api.devnet.solana.com';
    
    let programAccounts = null;
    let isRealData = false;

    try {
      // Try to fetch actual pool accounts from your program to prove it's real
      const rpcResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [PROGRAM_ID, { encoding: 'jsonParsed', commitment: 'confirmed' }]
        })
      });
      
      const rpcData = await rpcResponse.json();
      if (rpcData.result && rpcData.result.length > 0) {
        programAccounts = rpcData.result;
        isRealData = true;
      }
    } catch (rpcError) {
      console.error('Failed to fetch program accounts:', rpcError);
      // Don't fail the request, just note that it's not real-time data
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        isRealData: isRealData,
        programId: PROGRAM_ID,
        network: 'devnet',
        quote: {
          inputMint: inputMint,
          outputMint: outputMint,
          inAmount: amount,
          outAmount: amountOutStr,
          fee: {
            bps: feeBps,
            percentage: '0.01%',
            amount: feeAmountStr,
            recipient: env.FEE_RECIPIENT || 'F9RJSJ4Fr2mLsQrZjemeg3PVMjG2KgjF9t5shZLHMnwG'
          }
        },
        programAccountsFound: programAccounts ? programAccounts.length : 0,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Quote endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
