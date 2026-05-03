// Runs every 60 seconds to fetch all pools
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const RPC_URL = 'https://api.mainnet-beta.solana.com';
    const DEX_PROGRAMS = {
        raydium: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        orca: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
        meteora: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',
    };
    
    const allPools = [];
    
    for (const [dex, programId] of Object.entries(DEX_PROGRAMS)) {
        try {
            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getProgramAccounts',
                    params: [programId, { encoding: 'jsonParsed', commitment: 'confirmed' }]
                })
            });
            
            const data = await response.json();
            
            if (data.result) {
                for (const account of data.result) {
                    allPools.push({
                        dex,
                        address: account.pubkey,
                        ...parsePoolAccount(account, dex)
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${dex}:`, error);
        }
    }
    
    // Store in KV
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
        pools: allPools,
        lastUpdated: Date.now(),
        total: allPools.length
    }));
    
    return Response.json({
        success: true,
        total: allPools.length,
        lastUpdated: Date.now()
    });
}

function parsePoolAccount(account: any, dex: string) {
    // Parse based on DEX type
    // This is where you decode reserve data
    return {
        tokenA: account.account.data.parsed?.info?.mintA || 'unknown',
        tokenB: account.account.data.parsed?.info?.mintB || 'unknown',
        reserveA: account.account.data.parsed?.info?.reserveA || '0',
        reserveB: account.account.data.parsed?.info?.reserveB || '0',
    };
}
