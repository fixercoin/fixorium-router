export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  try {
    const { tokenIn, tokenOut, amountIn, slippage, contractAddress, recipient } = await request.json();
    
    if (!tokenIn || !tokenOut || !amountIn || !recipient) {
      return Response.json({ 
        error: 'Missing parameters: tokenIn, tokenOut, amountIn, recipient' 
      }, { status: 400 });
    }
    
    const amountInNum = parseFloat(amountIn);
    const feeAmount = amountInNum * 0.0001;
    const amountOut = amountInNum - feeAmount;
    const slippageBps = slippage || 100;
    const minAmountOut = amountOut - (amountOut * slippageBps / 10000);
    
    return Response.json({
      success: true,
      swap: {
        tokenIn,
        tokenOut,
        inAmount: amountIn,
        outAmount: amountOut.toString(),
        minAmountOut: minAmountOut.toString(),
        fee: {
          bps: 1,
          percentage: '0.01%',
          amount: feeAmount.toString()
        },
        recipient,
        contractAddress: contractAddress || '0x33C60168f237146647891BAae4ca4DF8Ac58D03E',
        transactionHash: '0x' + Math.random().toString(36).substring(2, 42)
      }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
