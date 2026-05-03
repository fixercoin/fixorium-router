export async function onRequestGet({ request, env }) {
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
  const network = url.searchParams.get('network') || 'devnet';
  
  if (!publicKey) {
    return Response.json({ error: 'Missing publicKey' }, { status: 400 });
  }
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  try {
    // Get SOL balance - REAL DATA
    const balanceRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [publicKey]
      })
    });
    const balanceData = await balanceRes.json();
    const lamports = balanceData.result?.value || 0;
    const solBalance = lamports / 1e9;
    
    // Get token accounts - REAL DATA
    const tokenRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner',
        params: [
          publicKey,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      })
    });
    const tokenData = await tokenRes.json();
    
    const tokens = [];
    if (tokenData.result && tokenData.result.value) {
      for (const acc of tokenData.result.value) {
        const info = acc.account.data.parsed.info;
        const balance = info.tokenAmount.uiAmount;
        if (balance > 0) {
          tokens.push({
            mint: info.mint,
            balance: balance,
            decimals: info.tokenAmount.decimals
          });
        }
      }
    }
    
    return Response.json({
      success: true,
      network,
      publicKey,
      lamports,
      solBalance,
      tokens,
      timestamp: Date.now()
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
