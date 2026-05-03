export async function onRequestGet({ request, env }) {
    try {
        // Use mock data directly - no RPC calls
        const mockPools = [
            { pubkey: 'So11111111111111111111111111111111111111112', account: { data: ['SOL-USDC'] } },
            { pubkey: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', account: { data: ['USDC-SOL'] } },
            { pubkey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', account: { data: ['USDT-SOL'] } },
        ];
        
        await env.DEVELOPERS_KV.put('all_pools', JSON.stringify({
            pools: mockPools,
            total: mockPools.length,
            lastUpdated: Date.now(),
            usingMock: true
        }));
        
        return Response.json({ 
            success: true, 
            total: mockPools.length,
            message: 'Cache populated with mock data'
        });
        
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        });
    }
}
