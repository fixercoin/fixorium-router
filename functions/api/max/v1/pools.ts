// /api/max/v1/pools.ts
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const mint = url.searchParams.get('mint');
    
    // Mock pools data - replace with actual data from your DEX
    const pools = [
      {
        id: "pool1",
        name: "SOL-USDC",
        mintA: "So11111111111111111111111111111111111111112",
        mintB: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        liquidity: "$1,234,567",
        volume24h: "$123,456",
        fee: "0.01%"
      },
      {
        id: "pool2",
        name: "SOL-USDT",
        mintA: "So11111111111111111111111111111111111111112",
        mintB: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        liquidity: "$987,654",
        volume24h: "$98,765",
        fee: "0.01%"
      },
      {
        id: "pool3",
        name: "USDC-USDT",
        mintA: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        mintB: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        liquidity: "$2,345,678",
        volume24h: "$234,567",
        fee: "0.01%"
      }
    ];
    
    // Filter by mint if provided
    let filteredPools = pools;
    if (mint) {
      filteredPools = pools.filter(pool => pool.mintA === mint || pool.mintB === mint);
    }
    
    return Response.json({
      success: true,
      pools: filteredPools,
      totalPools: filteredPools.length
    });
    
  } catch (error: any) {
    console.error('Pools endpoint error:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
