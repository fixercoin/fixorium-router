export async function onRequestGet({ request, env }) {
    // Use your own proxy endpoint instead of direct RPC
    const PROXY_URL = 'https://fixorium.com.pk/api/rpc/proxy';
    
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getProgramAccounts',
            params: ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', { encoding: 'base64', commitment: 'confirmed' }]
        })
    });
    
    const data = await response.json();
    
    // Parse and store pools
    const allPools = [];
    
    if (data.result && data.result.length > 0) {
        for (const account of data.result) {
            allPools.push({
                address: account.pubkey,
                data: account.account.data
            });
        }
    }
    
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
        pools: allPools,
        total: allPools.length,
        lastUpdated: Date.now()
    }));
    
    return Response.json({ 
        success: true, 
        total: allPools.length,
        message: `Cached ${allPools.length} pools via proxy`
    });
}
