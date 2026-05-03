export async function onRequestGet({ request, env }) {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
        return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = parseFloat(url.searchParams.get('amount') || '0');
    
    if (!inputMint || !outputMint || !amount) {
        return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Get from KV - FIXED
    const kvData = await env.DEVELOPERS_KV.get('all_pools');
    let cached = null;
    
    if (kvData) {
        try {
            cached = JSON.parse(kvData);
        } catch (e) {
            console.error('Failed to parse KV data:', e);
        }
    }
    
    // If no cache, use fallback
    if (!cached || !cached.pools || cached.pools.length === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'fallback',
            message: 'No pools in cache',
            poolsCount: cached?.pools?.length || 0,
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Find matching pools
    const relevantPools = cached.pools.filter((pool: any) => 
        (pool.tokenA === inputMint && pool.tokenB === outputMint) ||
        (pool.tokenA === outputMint && pool.tokenB === inputMint)
    );
    
    if (relevantPools.length === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'no_pool',
            message: `No pool found for this pair`,
            poolsScanned: cached.total,
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Calculate best output
    let bestOutput = 0;
    let bestPool = null;
    
    for (const pool of relevantPools) {
        let reserveIn, reserveOut;
        
        if (pool.tokenA === inputMint) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }
        
        if (reserveIn && reserveOut && reserveIn > 0) {
            const output = (amount * reserveOut) / (reserveIn + amount);
            if (output > bestOutput) {
                bestOutput = output;
                bestPool = pool;
            }
        }
    }
    
    if (bestOutput === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'calculation_failed',
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Apply 0.01% fee
    const feeAmount = bestOutput * 0.0001;
    const finalOutput = bestOutput - feeAmount;
    
    return Response.json({
        success: true,
        source: 'aggregator',
        poolsScanned: cached.total,
        poolUsed: bestPool?.dex,
        poolAddress: bestPool?.address,
        quote: {
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: finalOutput.toFixed(9),
            fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
        }
    });
}
