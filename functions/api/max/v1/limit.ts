import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const params = await request.json();
    const { inputMint, outputMint, inputAmount, triggerPrice, expiryDays, userPublicKey, network = 'devnet' } = params;
    
    if (!inputMint || !outputMint || !inputAmount || !triggerPrice || !userPublicKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const rpcUrl = network === 'devnet' 
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';
    
    const connection = new Connection(rpcUrl);
    const programId = new PublicKey(env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM');
    const userPubKey = new PublicKey(userPublicKey);
    
    // Create order account PDA
    const orderId = Date.now();
    const [orderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('limit'), Buffer.from(orderId.toString())],
      programId
    );
    
    // Here you would call YOUR program to create the limit order
    // This is where you would build and send the transaction to your program
    
    const order = {
      orderId,
      developerId: keyData.id,
      inputMint,
      outputMint,
      inputAmount,
      triggerPrice,
      expiryDays: expiryDays || 7,
      userPublicKey,
      status: 'active',
      createdAt: Date.now(),
      expiresAt: Date.now() + ((expiryDays || 7) * 24 * 60 * 60 * 1000),
      orderPda: orderPda.toString(),
      fee: inputAmount * 0.0001
    };
    
    // Store order in KV
    await env.DEVELOPERS_KV.put(`limit:${orderId}`, JSON.stringify(order));
    
    // Add to user's orders
    const userOrdersKey = `user:${keyData.id}:limitOrders`;
    const existingOrders = await env.DEVELOPERS_KV.get(userOrdersKey);
    const ordersList = existingOrders ? JSON.parse(existingOrders) : [];
    ordersList.push(orderId);
    await env.DEVELOPERS_KV.put(userOrdersKey, JSON.stringify(ordersList));
    
    return Response.json({
      success: true,
      orderId,
      orderPda: orderPda.toString(),
      inputMint,
      outputMint,
      inputAmount,
      triggerPrice,
      expiryDays: expiryDays || 7,
      status: 'active',
      createdAt: new Date(order.createdAt).toISOString(),
      expiresAt: new Date(order.expiresAt).toISOString(),
      fee: {
        bps: 1,
        percentage: '0.01%',
        amount: order.fee
      },
      message: 'Limit order created successfully'
    });
    
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

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
    const orderId = url.searchParams.get('orderId');
    
    if (orderId) {
      const orderData = await env.DEVELOPERS_KV.get(`limit:${orderId}`, 'json');
      if (!orderData) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      if (orderData.developerId !== keyData.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return Response.json({ order: orderData });
    } else {
      const userOrdersKey = `user:${keyData.id}:limitOrders`;
      const ordersList = await env.DEVELOPERS_KV.get(userOrdersKey);
      const orderIds = ordersList ? JSON.parse(ordersList) : [];
      const orders = [];
      for (const id of orderIds) {
        const order = await env.DEVELOPERS_KV.get(`limit:${id}`, 'json');
        if (order) orders.push(order);
      }
      return Response.json({ orders });
    }
    
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }: { request: Request; env: any }) {
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
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      return Response.json({ error: 'Missing orderId' }, { status: 400 });
    }
    
    const order = await env.DEVELOPERS_KV.get(`limit:${orderId}`, 'json');
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.developerId !== keyData.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    order.status = 'cancelled';
    await env.DEVELOPERS_KV.put(`limit:${orderId}`, JSON.stringify(order));
    
    return Response.json({ success: true, message: 'Order cancelled' });
    
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
