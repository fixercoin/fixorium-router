export async function onRequestGet({ request, env }) {
    const RPC_URL = env.SOLANA_RPC_URL;
    
    if (!RPC_URL) {
        return Response.json({ 
            success: false, 
            error: 'SOLANA_RPC_URL not configured' 
        });
    }
    
    const response = await fetch(RPC_URL, {
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
    
    if (data.result && data.result.length > 0) {
        await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
            pools: data.result,
            total: data.result.length,
            lastUpdated: Date.now(),
            usingMock: false
        }));
        
        return Response.json({ 
            success: true, 
            total: data.result.length,
            message: 'Real pool data cached from Helius'
        });
    }
    
    return Response.json({ 
        success: false, 
        total: 0,
        error: data.error 
    });
}
