export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const { email, projectName } = await context.request.json();

    const apiKey = 'max_' + crypto.randomUUID().replace(/-/g, '');
    const secretKey = 'sk_' + crypto.randomUUID().replace(/-/g, '');

    await context.env.MAX_KV.put(`user:${apiKey}`, JSON.stringify({
        email, projectName, apiKey, secretKey,
        createdAt: Date.now(),
        requests: 0,
        limit: 10000,
        volume: 0
    }));

    return new Response(JSON.stringify({
        success: true,
        apiKey, secretKey,
        message: 'STORE YOUR SECRET KEY SAFELY'
    }), { headers });
};
