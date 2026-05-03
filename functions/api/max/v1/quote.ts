export async function onRequestGet({ request, env }: { request: Request; env: any }) {
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
  
  // Calculate based on YOUR program's fee structure (0.01%)
  const amountNum = parseFloat(amount);
  const feeBps = 1; // Your program's fee
  const feeAmount = amountNum * (feeBps / 10000);
  const amountOut = amountNum - feeAmount;
  const programId = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  
  return Response.json({
    success: true,
    network,
    programId: programId,
    quote: {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: amountOut.toString(),
      fee: { 
        bps: feeBps, 
        percentage: '0.01%', 
        amount: feeAmount.toString(),
        recipient: env.FEE_RECIPIENT || 'F9RJSJ4Fr2mLsQrZjemeg3PVMjG2KgjF9t5shZLHMnwG'
      }
    },
    timestamp: Date.now()
  });
}
