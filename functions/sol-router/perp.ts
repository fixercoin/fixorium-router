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

    const { positionId, token, size, leverage, margin } = await context.request.json();

    const currentPrice = await getCurrentPrice(token);
    const liquidationPrice = size > 0 
        ? currentPrice * (1 - (1 / leverage))
        : currentPrice * (1 + (1 / leverage));

    const position = {
        positionId, token, size, leverage, margin,
        entryPrice: currentPrice,
        liquidationPrice: liquidationPrice,
        pnl: 0,
        status: 'OPEN',
        createdAt: Date.now(),
        user: apiKey
    };

    await context.env.MAX_KV.put(`perp:${positionId}`, JSON.stringify(position));

    return new Response(JSON.stringify({
        success: true,
        positionId: positionId,
        status: 'OPEN',
        entryPrice: currentPrice,
        liquidationPrice: liquidationPrice,
        leverage: leverage
    }), { headers });
};

async function getCurrentPrice(token: string): Promise<number> {
    return 150.0;
}
