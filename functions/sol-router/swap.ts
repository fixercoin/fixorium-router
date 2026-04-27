import { ALL_DEXES } from './dexes';

export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers });
    }

    const { fromToken, toToken, amount, walletPublicKey, slippage = 0.5 } = await context.request.json();

    const quotes = await Promise.all(
        Object.keys(ALL_DEXES).map(async (dex) => {
            const quote = await getQuoteFromDex(dex, fromToken, toToken, amount);
            return { dex, output: quote?.output || 0 };
        })
    );

    const bestDex = quotes.reduce((best, current) => current.output > best.output ? current : best, { dex: null, output: 0 });

    if (!bestDex.dex) {
        return new Response(JSON.stringify({ error: 'NO ROUTE FOUND' }), { status: 404, headers });
    }

    const minOutput = bestDex.output * (1 - slippage / 100);
    const fee = amount * 0.0001;

    const transaction = await buildSwapTransaction(walletPublicKey, fromToken, toToken, amount, minOutput, bestDex.dex);
    const signature = await sendTransaction(transaction);

    await trackUsage(apiKey, amount, context.env);

    return new Response(JSON.stringify({
        success: true,
        router: 'MAX ROUTER',
        domain: 'https://fixorium.com.pk',
        signature: signature,
        dex_used: bestDex.dex,
        amount_in: amount,
        amount_out: bestDex.output,
        min_output: minOutput,
        fee: fee,
        explorer_url: `https://solscan.io/tx/${signature}`
    }), { headers });
};

async function getQuoteFromDex(dex: string, from: string, to: string, amount: number) {
    try {
        if (dex === 'RAYDIUM') {
            const res = await fetch(`https://api.raydium.io/v2/main/quote?inputMint=${from}&outputMint=${to}&amount=${amount * 1e9}`);
            const data = await res.json();
            return { output: data.outputAmount / 1e9 };
        }
        return { output: amount * 1.0 };
    } catch {
        return null;
    }
}

async function buildSwapTransaction(wallet: string, from: string, to: string, amount: number, minOutput: number, dex: string) {
    return {
        version: 0,
        feePayer: wallet,
        instructions: [{
            programId: 'MAXRouter1111111111111111111111111111111111',
            accounts: [{ pubkey: wallet, isSigner: true, isWritable: true }],
            data: Buffer.from(JSON.stringify({ from, to, amount, minOutput, dex })).toString('base64')
        }]
    };
}

async function sendTransaction(transaction: any): Promise<string> {
    const solanaRpc = 'https://api.mainnet-beta.solana.com';
    const response = await fetch(solanaRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sendTransaction',
            params: [Buffer.from(JSON.stringify(transaction)).toString('base64'), { encoding: 'base64' }]
        })
    });
    const data = await response.json();
    return data.result;
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
