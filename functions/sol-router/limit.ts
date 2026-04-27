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

    const { orderId, tokenIn, tokenOut, amount, triggerPrice, isBuy, expiresIn } = await context.request.json();

    const order = {
        orderId, tokenIn, tokenOut, amount, triggerPrice, isBuy,
        status: 'PENDING',
        createdAt: Date.now(),
        expiresAt: Date.now() + (expiresIn * 1000),
        user: apiKey
    };

    await context.env.MAX_KV.put(`order:${orderId}`, JSON.stringify(order));

    return new Response(JSON.stringify({
        success: true,
        orderId: orderId,
        status: 'PENDING',
        message: 'LIMIT ORDER CREATED',
        triggerPrice: triggerPrice,
        expiresAt: order.expiresAt
    }), { headers });
};
