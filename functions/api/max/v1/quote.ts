import { Connection, PublicKey } from '@solana/web3.js';

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  const network = url.searchParams.get('network') || 'devnet';
  const slippageBps = url.searchParams.get('slippageBps') || '100';
  
  if (!inputMint || !outputMint || !amount) {
    return Response.json({ error: 'Missing parameters: inputMint, outputMint, amount' }, { status: 400 });
  }
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  try {
    const connection = new Connection(rpcUrl);
    const programId = new PublicKey(env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM');
    const inputMintPubkey = new PublicKey(inputMint);
    const outputMintPubkey = new PublicKey(outputMint);
    
    // Find quote PDA for this token pair
    const [quotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('quote'), inputMintPubkey.toBuffer(), outputMintPubkey.toBuffer()],
      programId
    );
    
    let quoteData = null;
    let price = 0;
    let amountOut = '0';
    let feeAmount = '0';
    
    // Try to get quote from YOUR program's PDA
    try {
      const quoteAccount = await connection.getAccountInfo(quotePda);
      if (quoteAccount && quoteAccount.data.length > 0) {
        // Parse your program's quote data structure
        // This depends on how you store quotes in your program
        const dataView = new DataView(quoteAccount.data.buffer);
        
        // Example parsing (adjust based on YOUR program's data layout)
        // Assuming: price stored as float64 at offset 8
        price = dataView.getFloat64(8, true);
        
        const amountNum = parseFloat(amount);
        const feeBps = 1; // 0.01% from your program
        feeAmount = (amountNum * feeBps / 10000).toString();
        amountOut = (amountNum - parseFloat(feeAmount)).toString();
        
        quoteData = {
          exists: true,
          pda: quotePda.toString(),
          price: price,
          inputMint: inputMint,
          outputMint: outputMint
        };
      } else {
        // Quote PDA not deployed yet, use default calculation
        const amountNum = parseFloat(amount);
        const feeBps = 1;
        feeAmount = (amountNum * feeBps / 10000).toString();
        amountOut = (amountNum - parseFloat(feeAmount)).toString();
      }
    } catch (e) {
      // If can't read PDA, use default calculation
      const amountNum = parseFloat(amount);
      const feeBps = 1;
      feeAmount = (amountNum * feeBps / 10000).toString();
      amountOut = (amountNum - parseFloat(feeAmount)).toString();
    }
    
    // Calculate minimum amount out based on slippage
    const slippage = parseInt(slippageBps) / 10000;
    const minAmountOut = (parseFloat(amountOut) * (1 - slippage)).toString();
    
    return Response.json({
      success: true,
      network,
      programId: programId.toString(),
      quotePda: quotePda.toString(),
      quote: {
        inputMint,
        outputMint,
        inAmount: amount,
        outAmount: amountOut,
        minAmountOut: minAmountOut,
        price: price,
        fee: { 
          bps: 1, 
          percentage: '0.01%', 
          amount: feeAmount,
          recipient: env.FEE_RECIPIENT || 'F9RJSJ4Fr2mLsQrZjemeg3PVMjG2KgjF9t5shZLHMnwG'
        },
        slippage: parseInt(slippageBps) / 100
      },
      onChainData: quoteData,
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    console.error('Quote error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to get quote from aggregator',
      network,
      inputMint,
      outputMint
    }, { status: 500 });
  }
}
