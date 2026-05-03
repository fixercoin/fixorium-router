export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const { inputMint, outputMint, totalAmount, amountPerCycle, cycleSeconds, totalCycles, userPublicKey } = await request.json();
  
  if (!inputMint || !outputMint || !totalAmount || !amountPerCycle || !cycleSeconds || !totalCycles || !userPublicKey) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const strategyId = Date.now();
  const totalDuration = cycleSeconds * totalCycles;
  
  return Response.json({
    success: true,
    strategyId,
    inputMint,
    outputMint,
    totalAmount,
    amountPerCycle,
    cycleSeconds,
    totalCycles,
    totalDuration,
    expectedEnd: new Date(Date.now() + (totalDuration * 1000)).toISOString(),
    userPublicKey,
    fee: { bps: 1, percentage: '0.01%' }
  });
}
