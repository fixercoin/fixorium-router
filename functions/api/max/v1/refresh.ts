export async function onRequestGet({ request, env }: { request: Request; env: any }) {
    // TEMPORARILY REMOVED AUTH FOR TESTING
    // const authHeader = request.headers.get('Authorization');
    // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    //     return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    console.log('Refreshing pools...');
    
    const RPC_URL = 'https://api.mainnet-beta.solana.com';
    const DEX_PROGRAMS = [
        { name: 'Raydium', id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' },
        { name: 'Orca', id: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc' },
        { name: 'Meteora', id: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB' },
    ];
    
    const allPools = [];
    
    for (const dex of DEX_PROGRAMS) {
        try {
            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getProgramAccounts',
                    params: [dex.id, { encoding: 'jsonParsed', commitment: 'confirmed' }]
                })
            });
            
            const data = await response.json();
            
            if (data.result && data.result.length > 0) {
                console.log(`${dex.name}: ${data.result.length} pools found`);
                allPools.push(...data.result);
            } else {
                console.log(`${dex.name}: No pools found or RPC error`);
            }
        } catch (error) {
            console.error(`Failed to fetch ${dex.name}:`, error);
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
        message: `Cached ${allPools.length} pools from ${DEX_PROGRAMS.length} DEXs`
    });
}
