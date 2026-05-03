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
  
  const strategyId = Date.now();
  const strategy = {
    strategyId,
    developerId: keyData.id,
    inputMint,
    outputMint,
    totalAmount,
    amountPerCycle,
    cycleSeconds,
    totalCycles,
    userPublicKey,
    status: 'active',
    createdAt: Date.now()
  };
  
  await env.DEVELOPERS_KV.put(`dca:${strategyId}`, JSON.stringify(strategy));
  
  return Response.json({
    success: true,
    strategyId: strategyId,
    status: 'active',
    message: 'DCA strategy created in your program'
  });
}
