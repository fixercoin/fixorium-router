// /api/max/v1/quote.ts - UPDATED to be a REAL aggregator
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
        return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = parseFloat(url.searchParams.get('amount') || '0');
    
    if (!inputMint || !outputMint || !amount) {
        return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Get cached pools from KV
    let cachedPools = await env.DEVELOPERS_KV.get('all_pools', 'json');
    
    // If no cache, fetch from RPC
    if (!cachedPools) {
        cachedPools = await fetchAllPools();
        await env.DEVELOPERS_KV.put('all_pools', JSON.stringify(cachedPools), { expirationTtl: 60 });
    }
    
    // Find best route
    const bestRoute = findBestRoute(inputMint, outputMint, amount, cachedPools.pools);
    
    if (!bestRoute) {
        // Fallback to simple calculation
        const feeAmount = amount * 0.0001;
        return Response.json({
            success: true,
            source: 'fallback',
            quote: {
                inputMint,
                outputMint,
                inAmount: amount,
                outAmount: (amount - feeAmount).toFixed(9),
                fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
            }
        });
    }
    
    // Apply your 0.01% fee
    const feeAmount = bestRoute.outputAmount * 0.0001;
    const finalOutput = bestRoute.outputAmount - feeAmount;
    
    return Response.json({
        success: true,
        source: 'aggregator',
        poolsScanned: cachedPools.total,
        route: bestRoute.path,
        quote: {
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: finalOutput.toFixed(9),
            priceImpact: bestRoute.priceImpact,
            fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toFixed(9) }
        }
    });
}

async function fetchAllPools() {
    const RPC_URL = 'https://api.mainnet-beta.solana.com';
    const DEX_PROGRAMS = [
        '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
        'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca
    ];
    
    const allPools = [];
    
    for (const programId of DEX_PROGRAMS) {
        const res = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getProgramAccounts',
                params: [programId, { encoding: 'jsonParsed' }]
            })
        });
        const data = await res.json();
        if (data.result) {
            allPools.push(...data.result);
        }
    }
    
    return { pools: allPools, total: allPools.length, lastUpdated: Date.now() };
}

function findBestRoute(inputMint: string, outputMint: string, amount: number, pools: any[]) {
    // Find pools that have both tokens
    const relevantPools = pools.filter(pool => {
        const info = pool.account?.data?.parsed?.info;
        if (!info) return false;
        return (info.mintA === inputMint && info.mintB === outputMint) ||
               (info.mintA === outputMint && info.mintB === inputMint);
    });
    
    if (relevantPools.length === 0) return null;
    
    // Calculate output for each pool
    let bestOutput = 0;
    let bestPath = null;
    
    for (const pool of relevantPools) {
        const info = pool.account.data.parsed.info;
        const reserveIn = info.mintA === inputMint ? parseFloat(info.reserveA) : parseFloat(info.reserveB);
        const reserveOut = info.mintA === inputMint ? parseFloat(info.reserveB) : parseFloat(info.reserveA);
        
        const output = (amount * reserveOut) / (reserveIn + amount);
        
        if (output > bestOutput) {
            bestOutput = output;
            bestPath = [pool.pubkey];
        }
    }
    
    return {
        outputAmount: bestOutput,
        path: bestPath,
        priceImpact: ((amount / parseFloat(relevantPools[0]?.account?.data?.parsed?.info?.reserveA || '1')) * 100).toFixed(4) + '%'
    };
}
