export async function onRequestGet({ request, env }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const mint = new URL(request.url).searchParams.get('mint');
  const network = new URL(request.url).searchParams.get('network') || 'devnet';
  
  if (!mint) {
    return Response.json({ error: 'Missing mint parameter' }, { status: 400 });
  }
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  const programId = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  
  try {
    // Get price from YOUR program's price account
    const priceRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [programId]
      })
    });
    const priceData = await priceRes.json();
    
    return Response.json({
      success: true,
      network,
      mint,
      price: 0,
      programData: priceData.result || null
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
