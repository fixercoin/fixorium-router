export async function onRequestGet({ request, env }: { request: Request; env: any }) {
    // Check secret
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const RPC_URL = 'https://api.mainnet-beta.solana.com';
    const DEX_PROGRAMS = [
        '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    ];
    
    const allPools = [];
    
    for (const programId of DEX_PROGRAMS) {
        const res = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getProgramAccounts',
                params: [programId, { encoding: 'jsonParsed' }]
            })
        });
        const data = await res.json();
        if (data.result) {
            allPools.push(...data.result);
        }
    }
    
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
        pools: allPools,
        total: allPools.length,
        lastUpdated: Date.now()
    }));
    
    return Response.json({ success: true, total: allPools.length });
}
