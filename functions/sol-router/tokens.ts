export const onRequest: PagesFunction = async (context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    const tokens = await getPopularTokens();

    return new Response(JSON.stringify({
        success: true,
        router: 'MAX ROUTER',
        count: tokens.length,
        tokens: tokens,
        timestamp: Date.now()
    }), { headers });
};

async function getPopularTokens(): Promise<any[]> {
    try {
        const response = await fetch('https://token.jup.ag/all');
        const tokens = await response.json();
        return tokens.slice(0, 100);
    } catch {
        return [
            { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', decimals: 9, name: 'SOLANA' },
            { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, name: 'USD COIN' },
            { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, name: 'TETHER' },
        ];
    }
}
