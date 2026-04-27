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

    const { orderId, tokenIn, tokenOut, totalAmount, amountPerTrade, intervalSeconds, totalTrades } = await context.request.json();

    const dcaOrder = {
        orderId, tokenIn, tokenOut, totalAmount, amountPerTrade, intervalSeconds, totalTrades,
        tradesExecuted: 0,
        nextExecution: Date.now() + (intervalSeconds * 1000),
        status: 'ACTIVE',
        createdAt: Date.now(),
        user: apiKey
    };

    await context.env.MAX_KV.put(`dca:${orderId}`, JSON.stringify(dcaOrder));

    return new Response(JSON.stringify({
        success: true,
        orderId: orderId,
        status: 'ACTIVE',
        nextExecution: dcaOrder.nextExecution,
        totalTrades: totalTrades,
        amountPerTrade: amountPerTrade
    }), { headers });
};
