interface LimitOrderParams {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  triggerPrice: number;
  expiryDays?: number;
  userPublicKey: string;
}

interface LimitOrder {
  orderId: number;
  developerId: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  triggerPrice: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  createdAt: number;
  expiresAt: number;
  filledAmount: number;
  fee: number;
  userPublicKey: string;
}

// POST - Create a new limit order
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
    
    const params: LimitOrderParams = await request.json();
    
    // Validate required fields
    if (!params.inputMint || !params.outputMint || !params.inputAmount || 
        !params.triggerPrice || !params.userPublicKey) {
      return Response.json({ 
        error: 'Missing required fields: inputMint, outputMint, inputAmount, triggerPrice, userPublicKey' 
      }, { status: 400 });
    }
    
    // Validate values
    if (params.inputAmount <= 0) {
      return Response.json({ error: 'inputAmount must be greater than 0' }, { status: 400 });
    }
    
    if (params.triggerPrice <= 0) {
      return Response.json({ error: 'triggerPrice must be greater than 0' }, { status: 400 });
    }
    
    const expiryDays = params.expiryDays || 7;
    if (expiryDays < 1 || expiryDays > 90) {
      return Response.json({ error: 'expiryDays must be between 1 and 90' }, { status: 400 });
    }
    
    const orderId = Date.now();
    const now = Date.now();
    const expiresAt = now + (expiryDays * 24 * 60 * 60 * 1000);
    const fee = params.inputAmount * 0.0001; // 0.01% fee
    
    const order: LimitOrder = {
      orderId,
      developerId: keyData.id,
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      inputAmount: params.inputAmount,
      triggerPrice: params.triggerPrice,
      status: 'active',
      createdAt: now,
      expiresAt,
      filledAmount: 0,
      fee,
      userPublicKey: params.userPublicKey
    };
    
    // Store order in KV
    const orderKey = `limit:${orderId}`;
    await env.DEVELOPERS_KV.put(orderKey, JSON.stringify(order));
    
    // Add to user's orders list
    const userOrdersKey = `user:${keyData.id}:limitOrders`;
    const existingOrders = await env.DEVELOPERS_KV.get(userOrdersKey);
    const ordersList = existingOrders ? JSON.parse(existingOrders) : [];
    ordersList.push(orderId);
    await env.DEVELOPERS_KV.put(userOrdersKey, JSON.stringify(ordersList));
    
    // Schedule a background check for expiry
    // This would ideally be handled by a cron job or Cloudflare Workers Cron Trigger
    // For now, we'll just create the order
    
    return Response.json({
      orderId: order.orderId,
      inputMint: order.inputMint,
      outputMint: order.outputMint,
      inputAmount: order.inputAmount,
      triggerPrice: order.triggerPrice,
      status: order.status,
      createdAt: new Date(order.createdAt).toISOString(),
      expiresAt: new Date(order.expiresAt).toISOString(),
      filledAmount: order.filledAmount,
      fee: order.fee,
      message: 'Limit order created successfully'
    });
    
  } catch (error: any) {
    console.error('Limit order create error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch limit orders
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
      // Fetch single order
      const orderKey = `limit:${orderId}`;
      const orderData = await env.DEVELOPERS_KV.get(orderKey, 'json');
      
      if (!orderData) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      
      // Verify ownership
      if (orderData.developerId !== keyData.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Check if order is expired
      if (orderData.status === 'active' && orderData.expiresAt < Date.now()) {
        orderData.status = 'expired';
        await env.DEVELOPERS_KV.put(orderKey, JSON.stringify(orderData));
      }
      
      return Response.json({
        order: {
          orderId: orderData.orderId,
          inputMint: orderData.inputMint,
          outputMint: orderData.outputMint,
          inputAmount: orderData.inputAmount,
          triggerPrice: orderData.triggerPrice,
          status: orderData.status,
          createdAt: new Date(orderData.createdAt).toISOString(),
          expiresAt: new Date(orderData.expiresAt).toISOString(),
          filledAmount: orderData.filledAmount,
          fee: orderData.fee
        }
      });
      
    } else {
      // Fetch all orders for this user
      const userOrdersKey = `user:${keyData.id}:limitOrders`;
      const ordersList = await env.DEVELOPERS_KV.get(userOrdersKey);
      const orderIds = ordersList ? JSON.parse(ordersList) : [];
      
      const orders = [];
      for (const id of orderIds) {
        const orderData = await env.DEVELOPERS_KV.get(`limit:${id}`, 'json');
        if (orderData) {
          // Check for expired orders
          if (orderData.status === 'active' && orderData.expiresAt < Date.now()) {
            orderData.status = 'expired';
            await env.DEVELOPERS_KV.put(`limit:${id}`, JSON.stringify(orderData));
          }
          
          orders.push({
            orderId: orderData.orderId,
            inputMint: orderData.inputMint,
            outputMint: orderData.outputMint,
            inputAmount: orderData.inputAmount,
            triggerPrice: orderData.triggerPrice,
            status: orderData.status,
            createdAt: new Date(orderData.createdAt).toISOString(),
            expiresAt: new Date(orderData.expiresAt).toISOString(),
            filledAmount: orderData.filledAmount
          });
        }
      }
      
      return Response.json({ orders });
    }
    
  } catch (error: any) {
    console.error('Limit order get error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel a limit order
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
      return Response.json({ error: 'Missing orderId parameter' }, { status: 400 });
    }
    
    const orderKey = `limit:${orderId}`;
    const orderData = await env.DEVELOPERS_KV.get(orderKey, 'json');
    
    if (!orderData) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (orderData.developerId !== keyData.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    if (orderData.status !== 'active') {
      return Response.json({ error: `Order cannot be cancelled. Status: ${orderData.status}` }, { status: 400 });
    }
    
    // Update order status to cancelled
    orderData.status = 'cancelled';
    await env.DEVELOPERS_KV.put(orderKey, JSON.stringify(orderData));
    
    return Response.json({
      success: true,
      message: 'Order cancelled successfully',
      orderId: parseInt(orderId)
    });
    
  } catch (error: any) {
    console.error('Limit order delete error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
