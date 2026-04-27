import { ALL_DEXES } from './dexes';

export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const url = new URL(context.request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const amount = parseFloat(url.searchParams.get('amount') || '100');

    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers });
    }

    const directRoutes = [];
    for (const [dexName, dexInfo] of Object.entries(ALL_DEXES)) {
        const quote = await getQuoteFromDex(dexName, from, to, amount);
        if (quote && quote.output > 0) {
            directRoutes.push({
                dex: dexName,
                name: dexInfo.name,
                type: dexInfo.type,
                output: quote.output,
                fee: dexInfo.fee
            });
        }
    }

    directRoutes.sort((a, b) => b.output - a.output);

    const multiHopRoutes = [];
    const intermediate = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const hop1 = await getBestQuote(from, intermediate, amount);
    const hop2 = await getBestQuote(intermediate, to, hop1?.output || 0);
    if (hop1 && hop2 && hop2.output > directRoutes[0]?.output) {
        multiHopRoutes.push({
            type: 'MULTI-HOP',
            path: [from, intermediate, to],
            output: hop2.output,
            improvement: ((hop2.output - directRoutes[0].output) / directRoutes[0].output) * 100
        });
    }

    return new Response(JSON.stringify({
        success: true,
        router: 'MAX ROUTER',
        from, to, amount,
        direct_routes: directRoutes.slice(0, 10),
        multi_hop_routes: multiHopRoutes,
        best_route: directRoutes[0],
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
        return null;
    } catch {
        return null;
    }
}

async function getBestQuote(from: string, to: string, amount: number): Promise<any> {
    for (const dex of Object.keys(ALL_DEXES)) {
        const quote = await getQuoteFromDex(dex, from, to, amount);
        if (quote) return quote;
    }
    return null;
}
