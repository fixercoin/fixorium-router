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
    
    // Get cached pools from KV
    const cached = await env.DEVELOPERS_KV.get('all_pools', 'json');
    
    // If no cache, use fallback
    if (!cached || !cached.pools || cached.pools.length === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'fallback',
            message: 'No pools in cache',
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Find pools with matching token pair
    const relevantPools = cached.pools.filter((pool: any) => 
        (pool.tokenA === inputMint && pool.tokenB === outputMint) ||
        (pool.tokenA === outputMint && pool.tokenB === inputMint)
    );
    
    if (relevantPools.length === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'no_pool_found',
            message: `No pool found for ${inputMint} -> ${outputMint}`,
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
    
    // Calculate best output using constant product formula
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
        
        // x * y = k formula
        const output = (amount * reserveOut) / (reserveIn + amount);
        
        if (output > bestOutput) {
            bestOutput = output;
            bestPool = pool;
        }
    }
    
    // Apply 0.01% fee
    const feeAmount = bestOutput * 0.0001;
    const finalOutput = bestOutput - feeAmount;
    const priceImpact = ((amount / (bestPool?.reserveA || 1)) * 100).toFixed(4);
    
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
            priceImpact: `${priceImpact}%`,
            fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
        }
    });
}
