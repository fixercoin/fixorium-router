export async function onRequestGet({ request, env }) {
    try {
        const RPC_URL = 'https://api.mainnet-beta.solana.com';
        const DEX_PROGRAMS = [
            { name: 'Raydium', id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' },
            { name: 'Orca', id: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc' },
        ];
        
        const allPools = [];
        
        for (const dex of DEX_PROGRAMS) {
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
                for (const account of data.result) {
                    const info = account.account?.data?.parsed?.info;
                    if (info && info.mintA && info.mintB && info.reserveA && info.reserveB) {
                        allPools.push({
                            dex: dex.name,
                            address: account.pubkey,
                            tokenA: info.mintA,
                            tokenB: info.mintB,
                            reserveA: parseFloat(info.reserveA),
                            reserveB: parseFloat(info.reserveB),
                        });
                    }
                }
            }
        }
        
        const cacheData = {
            pools: allPools,
            total: allPools.length,
            lastUpdated: Date.now()
        };
        
        await env.DEVELOPERS_KV.put('all_pools', JSON.stringify(cacheData));
        
        // Verify it was stored
        const verify = await env.DEVELOPERS_KV.get('all_pools');
        
        return Response.json({ 
            success: true, 
            total: allPools.length,
            stored: !!verify,
            verifiedSize: verify ? verify.length : 0
        });
        
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
