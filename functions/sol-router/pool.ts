export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers });
    }

    const { tokenA, tokenB, amountA, amountB, creator } = await context.request.json();

    const poolId = `pool_${tokenA.slice(0, 8)}_${tokenB.slice(0, 8)}_${Date.now()}`;
    const poolAddress = `MAXPool_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;

    const poolData = {
        id: poolId,
        address: poolAddress,
        tokenA, tokenB,
        reserveA: amountA,
        reserveB: amountB,
        totalLiquidity: amountA + amountB,
        creator: creator,
        createdAt: Date.now(),
        isActive: true
    };

    await context.env.MAX_KV.put(`pool:${poolId}`, JSON.stringify(poolData));

    const poolList = await context.env.MAX_KV.get('pool:list') || '[]';
    const pools = JSON.parse(poolList);
    pools.push(poolId);
    await context.env.MAX_KV.put('pool:list', JSON.stringify(pools));

    return new Response(JSON.stringify({
        success: true,
        poolId: poolId,
        poolAddress: poolAddress,
        tokenA, tokenB,
        reserveA: amountA,
        reserveB: amountB,
        message: 'POOL CREATED'
    }), { headers });
};
