import { Aggregator } from '../../../../src/aggregator';

let aggregator: Aggregator | null = null;

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  // Get API key from header
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Verify API key from DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`aggregator_key:${apiKey}`, 'json');
  
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid or inactive API key' }, { status: 401 });
  }
  
  // Update usage count
  keyData.usage++;
  await env.DEVELOPERS_KV.put(`aggregator_key:${apiKey}`, JSON.stringify(keyData));
  
  // Initialize aggregator once
  if (!aggregator) {
    aggregator = new Aggregator();
    await aggregator.refreshPools();
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  
  if (!inputMint || !outputMint || !amount) {
    return Response.json({ error: 'Missing parameters: inputMint, outputMint, amount' }, { status: 400 });
  }
  
  const quote = await aggregator.getQuote({
    inputMint,
    outputMint,
    amount,
    slippage: parseInt(url.searchParams.get('slippage') || '100')
  });
  
  return Response.json({
    success: true,
    ...quote,
    apiKeyInfo: {
      name: keyData.name,
      usage: keyData.usage,
      rateLimit: keyData.rateLimit
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
}
