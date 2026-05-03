export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const mint = new URL(request.url).searchParams.get('mint');
  
  // Return price from YOUR program's calculation
  return Response.json({
    success: true,
    mint: mint,
    price: 0, // Your program should calculate this
    message: 'Price data from your aggregator program'
  });
}
