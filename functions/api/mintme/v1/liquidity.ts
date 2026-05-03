export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  try {
    const url = new URL(request.url);
    const tokenAddress = url.searchParams.get('tokenAddress');
    const contractAddress = url.searchParams.get('contractAddress');
    
    // Mock liquidity pools - replace with actual data
    const pools = [
      {
        id: 'mintme_eth_usdc',
        token0: '0x0000000000000000000000000000000000000000',
        token1: '0x091da08c5bf888252ed1ab3e44246cbf72d63307',
        reserve0: '1000000000000000000',
        reserve1: '2000000000',
        totalLiquidity: '$2,000,000',
        apr: '12.5%'
      },
      {
        id: 'mintme_usdc_usdt',
        token0: '0x091da08c5bf888252ed1ab3e44246cbf72d63307',
        token1: '0x55d398326f99059ff775485246999027b3197955',
        reserve0: '5000000000',
        reserve1: '5000000000',
        totalLiquidity: '$10,000,000',
        apr: '8.2%'
      }
    ];
    
    let filteredPools = pools;
    if (tokenAddress) {
      filteredPools = pools.filter(pool => 
        pool.token0.toLowerCase() === tokenAddress.toLowerCase() || 
        pool.token1.toLowerCase() === tokenAddress.toLowerCase()
      );
    }
    
    return Response.json({
      success: true,
      pools: filteredPools,
      totalLiquidity: '$12,000,000',
      contractAddress: contractAddress || '0x33C60168f237146647891BAae4ca4DF8Ac58D03E'
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
