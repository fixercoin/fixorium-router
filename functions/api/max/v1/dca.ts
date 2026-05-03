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
    
    const { inputMint, outputMint, totalAmount, amountPerCycle, cycleSeconds, totalCycles, userPublicKey, network = 'devnet' } = await request.json();
    
    if (!inputMint || !outputMint || !totalAmount || !amountPerCycle || !cycleSeconds || !totalCycles || !userPublicKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const rpcUrl = network === 'devnet' 
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';
    
    // Get real blockhash
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
    
    const strategyId = Date.now();
    const totalDuration = cycleSeconds * totalCycles;
    
    await env.DEVELOPERS_KV.put(`dca:${strategyId}`, JSON.stringify({
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
      createdAt: Date.now(),
      expectedEnd: Date.now() + (totalDuration * 1000)
    }));
    
    return Response.json({
      success: true,
      strategyId,
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
    
    const strategyId = new URL(request.url).searchParams.get('strategyId');
    
    if (strategyId) {
      const strategy = await env.DEVELOPERS_KV.get(`dca:${strategyId}`, 'json');
      if (!strategy) {
        return Response.json({ error: 'Strategy not found' }, { status: 404 });
      }
      return Response.json({ success: true, strategy });
    }
    
    return Response.json({ success: true, strategies: [] });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
