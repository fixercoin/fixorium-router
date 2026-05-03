export async function onRequestPost({ request, env }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const { inputMint, outputMint, inputAmount, triggerPrice, userPublicKey, network = 'devnet' } = await request.json();
    
    if (!inputMint || !outputMint || !inputAmount || !triggerPrice || !userPublicKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const rpcUrl = network === 'devnet' 
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';
    
    // Get real blockhash for transaction
    const blockhashRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: []
      })
    });
    const blockhashData = await blockhashRes.json();
    
    const orderId = Date.now();
    
    // Store order in KV
    await env.DEVELOPERS_KV.put(`limit:${orderId}`, JSON.stringify({
      orderId,
      developerId: keyData.id,
      inputMint,
      outputMint,
      inputAmount,
      triggerPrice,
      userPublicKey,
      status: 'active',
      createdAt: Date.now()
    }));
    
    return Response.json({
      success: true,
      orderId,
      status: 'active',
      blockhash: blockhashData.result?.value?.blockhash || null
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const orderId = new URL(request.url).searchParams.get('orderId');
    
    if (orderId) {
      const order = await env.DEVELOPERS_KV.get(`limit:${orderId}`, 'json');
      if (!order) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      return Response.json({ success: true, order });
    }
    
    return Response.json({ success: true, orders: [] });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
