import { ALL_DEXES } from './dexes';

export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const url = new URL(context.request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const amount = parseFloat(url.searchParams.get('amount') || '1');

    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers });
    }

    const quotes = await Promise.all(
        Object.entries(ALL_DEXES).map(async ([dexName, dexInfo]) => {
            const quote = await getQuoteFromDex(dexName, from, to, amount);
            return {
                dex: dexName,
                name: dexInfo.name,
                output: quote?.output || 0,
                fee: dexInfo.fee,
                type: dexInfo.type,
            };
        })
    );

    const validQuotes = quotes.filter(q => q.output > 0);
    validQuotes.sort((a, b) => b.output - a.output);

    const bestRoute = validQuotes[0];
    const top3 = validQuotes.slice(0, 3);
    const splitAmount = amount / 3;
    const splitOutput = top3.reduce((sum, dex) => sum + (dex.output * splitAmount / amount), 0);
    const improvePercent = ((splitOutput - bestRoute.output) / bestRoute.output) * 100;

    await trackUsage(apiKey, amount, context.env);

    return new Response(JSON.stringify({
        success: true,
        router: 'MAX ROUTER',
        from, to, amount,
        total_dexes: validQuotes.length,
        best_route: bestRoute,
        top_3_routes: top3,
        split_route: {
            enabled: improvePercent > 0,
            total_output: splitOutput,
            improvement: `${improvePercent.toFixed(2)}%`,
            routes: top3.map(dex => ({ dex: dex.dex, amount: splitAmount, output: dex.output * splitAmount / amount }))
        },
        fee: { percent: '0.01%', amount: amount * 0.0001 },
        timestamp: Date.now()
    }), { headers });
};

async function getQuoteFromDex(dex: string, from: string, to: string, amount: number) {
    try {
        if (dex === 'RAYDIUM') {
            const res = await fetch(`https://api.raydium.io/v2/main/quote?inputMint=${from}&outputMint=${to}&amount=${amount * 1e9}`);
            const data = await res.json();
            return { output: data.outputAmount / 1e9 };
        }
        if (dex === 'ORCA') {
            const res = await fetch(`https://api.orca.so/quote?inputMint=${from}&outputMint=${to}&amount=${amount}`);
            const data = await res.json();
            return { output: data.outputAmount };
        }
        if (dex === 'METEORA') {
            const res = await fetch(`https://dlmm-api.meteora.ag/quote?mintA=${from}&mintB=${to}&amountA=${amount}`);
            const data = await res.json();
            return { output: data.amountB };
        }
        if (dex === 'JUPITER') {
            const res = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${amount * 1e9}`);
            const data = await res.json();
            return { output: data.outAmount / 1e9 };
        }
        return { output: amount * 1.0 };
    } catch {
        return null;
    }
}

async function trackUsage(apiKey: string, amount: number, env: any) {
    const userStr = await env.MAX_KV.get(`user:${apiKey}`);
    if (userStr) {
        const user = JSON.parse(userStr);
        user.requests++;
        user.volume += amount;
        await env.MAX_KV.put(`user:${apiKey}`, JSON.stringify(user));
    }
}
