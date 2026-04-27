export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers });
    }

    const userStr = await context.env.MAX_KV.get(`user:${apiKey}`);
    if (!userStr) {
        return new Response(JSON.stringify({ error: 'INVALID API KEY' }), { status: 401, headers });
    }

    const user = JSON.parse(userStr);

    return new Response(JSON.stringify({
        success: true,
        email: user.email,
        projectName: user.projectName,
        requestsUsed: user.requests,
        requestsLimit: user.limit,
        volume24h: user.volume,
        createdAt: user.createdAt
    }), { headers });
};
