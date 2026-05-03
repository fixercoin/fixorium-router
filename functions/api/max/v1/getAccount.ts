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
  const publicKey = url.searchParams.get('publicKey');
  
  if (!publicKey) {
    return Response.json({ error: 'Missing publicKey parameter' }, { status: 400 });
  }
  
  // Mock account data - replace with actual RPC call
  return Response.json({
    success: true,
    publicKey,
    lamports: 5000000000,
    solBalance: 5.0,
    tokens: [
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', balance: 1000, symbol: 'USDC' },
      { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', balance: 500, symbol: 'USDT' }
    ],
    transactionCount: 125
  });
}
