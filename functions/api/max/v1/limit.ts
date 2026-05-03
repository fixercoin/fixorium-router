export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const { inputMint, outputMint, inputAmount, triggerPrice, userPublicKey } = await request.json();
  
  const orderId = Date.now();
  const order = {
    orderId,
    developerId: keyData.id,
    inputMint,
    outputMint,
    inputAmount,
    triggerPrice,
    userPublicKey,
    status: 'active',
    createdAt: Date.now()
  };
  
  await env.DEVELOPERS_KV.put(`limit:${orderId}`, JSON.stringify(order));
  
  return Response.json({
    success: true,
    orderId: orderId,
    status: 'active',
    message: 'Limit order created in your program'
  });
}
