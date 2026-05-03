export async function onRequestGet({ request, env }) {
    const RPC_URL = env.SOLANA_RPC_URL;
    
    if (!RPC_URL) {
        return Response.json({ success: false, error: 'SOLANA_RPC_URL not configured' });
    }
    
    let allPools = [];
    let paginationKey = null;
    let hasMore = true;
    
    // Paginate through all Raydium pools
    while (hasMore) {
        const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'getProgramAccountsV2',  // Use V2 method
            params: [
                '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium program
                {
                    encoding: 'base64',
                    commitment: 'confirmed',
                    limit: 1000,  // Max per request
                    ...(paginationKey && { paginationKey })
                }
            ]
        };
        
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.error) {
            return Response.json({ success: false, error: data.error });
        }
        
        if (data.result && data.result.accounts) {
            allPools.push(...data.result.accounts);
        }
        
        paginationKey = data.result?.paginationKey;
        hasMore = !!paginationKey;
    }
    
    // Save to KV
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
        pools: allPools,
        total: allPools.length,
        lastUpdated: Date.now(),
        usingMock: false
    }));
    
    return Response.json({ 
        success: true, 
        total: allPools.length,
        message: `Cached ${allPools.length} Raydium pools using pagination`
    });
}
