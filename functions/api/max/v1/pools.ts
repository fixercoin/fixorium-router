export async function onRequestGet({ request, env }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const network = new URL(request.url).searchParams.get('network') || 'devnet';
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  const programId = env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  
  try {
    // Get all pool accounts from YOUR program
    const poolsRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [programId, { encoding: 'base64' }]
      })
    });
    const poolsData = await poolsRes.json();
    
    return Response.json({
      success: true,
      network,
      programId,
      totalPools: poolsData.result?.length || 0,
      pools: poolsData.result || [],
      timestamp: Date.now()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
