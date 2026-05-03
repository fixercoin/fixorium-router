export async function onRequestGet({ request, env }) {
    const RPC_URL = env.SOLANA_RPC_URL;
    
    if (!RPC_URL) {
        return Response.json({ success: false, error: 'SOLANA_RPC_URL not configured' });
    }
    
    let allPools = [];
    let paginationKey = null;
    let hasMore = true;
    
    while (hasMore) {
        const requestBody: any = {
            jsonrpc: '2.0',
            id: 1,
            method: 'getProgramAccountsV2',
            params: [
                '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
                {
                    encoding: 'base64',
                    commitment: 'confirmed',
                    limit: 100,  // Reduced from 1000 to avoid rate limits
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
            if (data.error.code === -32429) {
                // Rate limited - wait and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            return Response.json({ success: false, error: data.error });
        }
        
        if (data.result && data.result.accounts) {
            allPools.push(...data.result.accounts);
        }
        
        paginationKey = data.result?.paginationKey;
        hasMore = !!paginationKey;
        
        // Add delay between requests to avoid rate limiting
        if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
        pools: allPools,
        total: allPools.length,
        lastUpdated: Date.now(),
        usingMock: false
    }));
    
    return Response.json({ 
        success: true, 
        total: allPools.length,
        message: `Cached ${allPools.length} Raydium pools`
    });
}
