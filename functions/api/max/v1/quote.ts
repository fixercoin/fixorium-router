// api/max/v1/quote.ts
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  
  if (!inputMint || !outputMint || !amount) {
    return new Response(JSON.stringify({ error: 'Missing parameters: inputMint, outputMint, amount' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const amountNum = parseFloat(amount);
  const feeBps = 1;
  const feeAmount = amountNum * (feeBps / 10000);
  const amountOut = amountNum - feeAmount;
  const programId = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  
  return new Response(JSON.stringify({
    success: true,
    programId: programId,
    quote: {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: amountOut.toString(),
      fee: {
        bps: feeBps,
        percentage: '0.01%',
        amount: feeAmount.toString()
      }
    },
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
