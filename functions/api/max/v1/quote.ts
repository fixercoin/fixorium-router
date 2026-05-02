export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.API_KEYS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  
  if (!inputMint || !outputMint || !amount) {
    return Response.json({ error: 'Missing parameters: inputMint, outputMint, amount' }, { status: 400 });
  }
  
  const amountIn = BigInt(amount);
  const feeAmount = (amountIn * BigInt(1)) / BigInt(10000);
  const amountOut = amountIn - feeAmount;
  
  return Response.json({
    success: true,
    quote: {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: amountOut.toString(),
      fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toString(), recipient: 'F9RJSJ4Fr2mLsQrZjemeg3PVMjG2KgjF9t5shZLHMnwG' }
    }
  });
}
