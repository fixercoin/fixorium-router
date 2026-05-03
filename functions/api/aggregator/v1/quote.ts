export async function onRequestGet({ request, env }: { request: Request; env: any }) {
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
    
    // Get cached pools from KV (updated every 60 seconds)
    const cached = await env.DEVELOPERS_KV.get('all_pools', 'json');
    
    if (!cached || !cached.pools) {
        // Fallback calculation
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'calculation',
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Find pools for this token pair
    const relevantPools = cached.pools.filter((pool: any) => 
        (pool.tokenA === inputMint && pool.tokenB === outputMint) ||
        (pool.tokenA === outputMint && pool.tokenB === inputMint)
    );
    
    if (relevantPools.length === 0) {
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'no_pool_found',
            message: 'No pool found for this pair',
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Calculate real output from best pool
    let bestOutput = 0;
    let bestPool = null;
    
    for (const pool of relevantPools) {
        const reserveIn = parseFloat(pool.tokenA === inputMint ? pool.reserveA : pool.reserveB);
        const reserveOut = parseFloat(pool.tokenA === inputMint ? pool.reserveB : pool.reserveA);
        
        // Constant product formula
        const output = (amount * reserveOut) / (reserveIn + amount);
        
        if (output > bestOutput) {
            bestOutput = output;
            bestPool = pool;
        }
    }
    
    // Apply 0.01% fee
    const feeAmount = bestOutput * 0.0001;
    const finalOutput = bestOutput - feeAmount;
    
    return Response.json({
        success: true,
        source: 'kv_cache',
        poolCount: cached.total,
        poolUsed: bestPool?.dex,
        poolAddress: bestPool?.address,
        quote: {
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: finalOutput.toFixed(9),
            priceImpact: ((amount / parseFloat(bestPool?.reserveA || '1')) * 100).toFixed(4) + '%',
            fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
        }
    });
}
