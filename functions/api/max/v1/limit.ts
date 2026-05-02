interface Env {
  DEVELOPERS_KV: KVNamespace;  // Changed from API_KEYS_KV
}

export async function onRequestPost(request: Request, context: { env: Env }) {
  const env = context.env;
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || (keyData as any).status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const { 
    inputMint, 
    outputMint, 
    inputAmount, 
    triggerPrice, 
    expiryDays = 7 
  } = await request.json();
  
  if (!inputMint || !outputMint || !inputAmount || !triggerPrice) {
    return Response.json({ 
      error: 'Missing required fields: inputMint, outputMint, inputAmount, triggerPrice' 
    }, { status: 400 });
  }
  
  const orderId = Date.now();
  const expiry = Math.floor(Date.now() / 1000) + (expiryDays * 86400);
  
  // Here you would call your Limit Orders program to create the order
  // For now, return the order details
  
  return Response.json({
    success: true,
    orderId,
    inputMint,
    outputMint,
    inputAmount,
    triggerPrice,
    expiry: new Date(expiry * 1000).toISOString(),
    status: 'active',
    fee: {
      bps: 1,
      percentage: '0.01%'
    }
  });
}

export async function onRequestGet(request: Request, context: { env: Env }) {
  const env = context.env;
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || (keyData as any).status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');
  
  if (orderId) {
    // Fetch single order details
    return Response.json({
      success: true,
      order: {
        orderId: parseInt(orderId),
        status: 'active',
        createdAt: new Date().toISOString()
      }
    });
  } else {
    // Fetch all orders for this API key
    return Response.json({
      success: true,
      orders: []
    });
  }
}
