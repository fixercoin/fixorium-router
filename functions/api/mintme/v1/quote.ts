export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  try {
    const { tokenIn, tokenOut, amountIn, contractAddress } = await request.json();
    
    if (!tokenIn || !tokenOut || !amountIn) {
      return Response.json({ 
        error: 'Missing parameters: tokenIn, tokenOut, amountIn' 
      }, { status: 400 });
    }
    
    // Mock quote response - replace with actual DEX calculation
    const amountInNum = parseFloat(amountIn);
    const feeAmount = amountInNum * 0.0001; // 0.01% fee
    const amountOut = amountInNum - feeAmount;
    
    return Response.json({
      success: true,
      quote: {
        tokenIn,
        tokenOut,
        inAmount: amountIn,
        outAmount: amountOut.toString(),
        fee: {
          bps: 1,
          percentage: '0.01%',
          amount: feeAmount.toString()
        },
        contractAddress: contractAddress || '0x33C60168f237146647891BAae4ca4DF8Ac58D03E'
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
