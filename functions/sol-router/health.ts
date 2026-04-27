export const onRequest: PagesFunction = async () => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    return new Response(JSON.stringify({
        status: 'healthy',
        router: 'MAX ROUTER',
        domain: 'https://fixorium.com.pk',
        version: '2.0.0',
        fee: '0.01%',
        dexes: 30,
        uptime: process.uptime(),
        timestamp: Date.now()
    }), { headers });
};
