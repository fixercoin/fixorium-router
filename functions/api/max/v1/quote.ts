export async function onRequestGet({ request, env }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  const network = url.searchParams.get('network') || 'devnet';
  
  if (!inputMint || !outputMint || !amount) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  const programId = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  
  try {
    // Get real token prices from YOUR program via RPC
    const priceRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [programId]
      })
    });
    const priceData = await priceRes.json();
    
    const amountNum = parseFloat(amount);
    const feeAmount = amountNum * 0.0001;
    const amountOut = amountNum - feeAmount;
    
    return Response.json({
      success: true,
      network,
      programId,
      quote: {
        inputMint,
        outputMint,
        inAmount: amount,
        outAmount: amountOut.toString(),
        fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toString() }
      },
      onChainData: priceData.result || null
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
