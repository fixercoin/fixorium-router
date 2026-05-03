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
  const mint = url.searchParams.get('mint');
  
  if (!mint) {
    return Response.json({ error: 'Missing mint parameter' }, { status: 400 });
  }
  
  // Mock price data - replace with actual price feed
  const prices: Record<string, number> = {
    'So11111111111111111111111111111111111111112': 150.50,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.00,
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1.00
  };
  
  return Response.json({
    success: true,
    mint,
    price: prices[mint] || 0,
    priceChange24h: 2.5,
    volume24h: 1250000,
    timestamp: Date.now()
  });
}
