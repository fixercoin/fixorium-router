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
    
    const YOUR_PROGRAM_ID = 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
    const RPC_URL = 'https://api.devnet.solana.com';
    
    // Check if your program exists on devnet
    const programInfo = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [YOUR_PROGRAM_ID]
      })
    });
    
    const programData = await programInfo.json();
    
    return Response.json({
      success: true,
      programId: YOUR_PROGRAM_ID,
      programExists: programData.result !== null,
      programInfo: programData.result,
      rpcUrl: RPC_URL,
      timestamp: Date.now()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
