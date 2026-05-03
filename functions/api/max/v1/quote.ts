export async function onRequestGet({ request, env }) {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
        return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = parseFloat(url.searchParams.get('amount') || '0');
    
    // Get cached pools
    const kvData = await env.DEVELOPERS_KV.get('all_pools');
    const cached = kvData ? JSON.parse(kvData) : null;
    
    const amountNum = amount;
    const feeAmount = amountNum * 0.0001;
    
    // Use cached data if available
    if (cached && cached.pools && cached.pools.length > 0) {
        const relevantPools = cached.pools.filter(pool => {
            // This is simplified - you'd need proper pool parsing
            return pool.pubkey && pool.pubkey.length > 0;
        });
        
        return Response.json({
            success: true,
            source: 'cache',
            poolsInCache: cached.total,
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amountNum - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Fallback when cache is empty
    return Response.json({
        success: true,
        source: 'fallback',
        message: 'Cache being populated, run refresh endpoint',
        quote: {
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: (amountNum - feeAmount).toFixed(9),
            fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
        }
    });
}
