interface DCAParams {
  inputMint: string;
  outputMint: string;
  totalAmount: number;
  amountPerCycle: number;
  cycleSeconds: number;
  totalCycles: number;
  userPublicKey: string;
}

interface DCAStrategy {
  strategyId: number;
  developerId: string;
  inputMint: string;
  outputMint: string;
  totalAmount: number;
  amountPerCycle: number;
  cycleSeconds: number;
  totalCycles: number;
  completedCycles: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'withdrawn';
  nextExecution: number;
  expectedEnd: number;
  createdAt: number;
  fee: number;
}

// POST - Create a new DCA strategy
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }
    
    // Verify API key
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Parse request body
    const params: DCAParams = await request.json();
    
    // Validate required fields
    if (!params.inputMint || !params.outputMint || !params.totalAmount || 
        !params.amountPerCycle || !params.cycleSeconds || !params.totalCycles || !params.userPublicKey) {
      return Response.json({ 
        error: 'Missing required fields: inputMint, outputMint, totalAmount, amountPerCycle, cycleSeconds, totalCycles, userPublicKey' 
      }, { status: 400 });
    }
    
    // Validate values
    if (params.amountPerCycle > params.totalAmount) {
      return Response.json({ error: 'amountPerCycle cannot exceed totalAmount' }, { status: 400 });
    }
    
    if (params.cycleSeconds < 60) {
      return Response.json({ error: 'cycleSeconds must be at least 60 seconds' }, { status: 400 });
    }
    
    if (params.totalCycles < 1 || params.totalCycles > 365) {
      return Response.json({ error: 'totalCycles must be between 1 and 365' }, { status: 400 });
    }
    
    // Calculate strategy details
    const strategyId = Date.now();
    const totalCyclesCompleted = 0;
    const remainingAmount = params.totalAmount;
    const totalDuration = params.cycleSeconds * params.totalCycles;
    const now = Date.now();
    const nextExecution = now + params.cycleSeconds * 1000;
    const expectedEnd = now + (totalDuration * 1000);
    const fee = params.totalAmount * 0.0001; // 0.01% fee
    
    const strategy: DCAStrategy = {
      strategyId,
      developerId: keyData.id,
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      totalAmount: params.totalAmount,
      amountPerCycle: params.amountPerCycle,
      cycleSeconds: params.cycleSeconds,
      totalCycles: params.totalCycles,
      completedCycles: totalCyclesCompleted,
      remainingAmount: remainingAmount,
      status: 'active',
      nextExecution,
      expectedEnd,
      createdAt: now,
      fee
    };
    
    // Store strategy in KV
    const storageKey = `dca:${strategyId}`;
    const userStrategiesKey = `user:${keyData.id}:dca`;
    
    await env.DEVELOPERS_KV.put(storageKey, JSON.stringify(strategy));
    
    // Add to user's strategies list
    const existingStrategies = await env.DEVELOPERS_KV.get(userStrategiesKey);
    const strategiesList = existingStrategies ? JSON.parse(existingStrategies) : [];
    strategiesList.push(strategyId);
    await env.DEVELOPERS_KV.put(userStrategiesKey, JSON.stringify(strategiesList));
    
    // Fetch user's email for response
    const userEmail = keyData.email;
    
    return Response.json({
      success: true,
      strategyId: strategy.strategyId,
      inputMint: strategy.inputMint,
      outputMint: strategy.outputMint,
      totalAmount: strategy.totalAmount,
      amountPerCycle: strategy.amountPerCycle,
      cycleSeconds: strategy.cycleSeconds,
      totalCycles: strategy.totalCycles,
      completedCycles: strategy.completedCycles,
      remainingAmount: strategy.remainingAmount,
      status: strategy.status,
      nextExecution: new Date(strategy.nextExecution).toISOString(),
      expectedEnd: new Date(strategy.expectedEnd).toISOString(),
      createdAt: new Date(strategy.createdAt).toISOString(),
      fee: {
        bps: 1,
        percentage: '0.01%',
        amount: strategy.fee
      },
      message: 'DCA strategy created successfully'
    });
    
  } catch (error: any) {
    console.error('DCA create error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch DCA strategies
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
    const strategyId = url.searchParams.get('strategyId');
    
    if (strategyId) {
      // Fetch single strategy
      const strategyKey = `dca:${strategyId}`;
      const strategyData = await env.DEVELOPERS_KV.get(strategyKey, 'json');
      
      if (!strategyData) {
        return Response.json({ error: 'Strategy not found' }, { status: 404 });
      }
      
      // Verify ownership
      if (strategyData.developerId !== keyData.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      return Response.json({
        success: true,
        strategy: {
          strategyId: strategyData.strategyId,
          inputMint: strategyData.inputMint,
          outputMint: strategyData.outputMint,
          totalAmount: strategyData.totalAmount,
          amountPerCycle: strategyData.amountPerCycle,
          cycleSeconds: strategyData.cycleSeconds,
          totalCycles: strategyData.totalCycles,
          completedCycles: strategyData.completedCycles,
          remainingAmount: strategyData.remainingAmount,
          status: strategyData.status,
          nextExecution: new Date(strategyData.nextExecution).toISOString(),
          expectedEnd: new Date(strategyData.expectedEnd).toISOString(),
          createdAt: new Date(strategyData.createdAt).toISOString()
        }
      });
      
    } else {
      // Fetch all strategies for this user
      const userStrategiesKey = `user:${keyData.id}:dca`;
      const strategiesList = await env.DEVELOPERS_KV.get(userStrategiesKey);
      const strategyIds = strategiesList ? JSON.parse(strategiesList) : [];
      
      const strategies = [];
      for (const id of strategyIds) {
        const strategyData = await env.DEVELOPERS_KV.get(`dca:${id}`, 'json');
        if (strategyData) {
          strategies.push({
            strategyId: strategyData.strategyId,
            inputMint: strategyData.inputMint,
            outputMint: strategyData.outputMint,
            totalAmount: strategyData.totalAmount,
            amountPerCycle: strategyData.amountPerCycle,
            completedCycles: strategyData.completedCycles,
            remainingAmount: strategyData.remainingAmount,
            status: strategyData.status,
            nextExecution: new Date(strategyData.nextExecution).toISOString()
          });
        }
      }
      
      return Response.json({
        success: true,
        strategies,
        total: strategies.length
      });
    }
    
  } catch (error: any) {
    console.error('DCA get error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Withdraw funds from a DCA strategy
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
    const strategyId = url.searchParams.get('strategyId');
    
    if (!strategyId) {
      return Response.json({ error: 'Missing strategyId parameter' }, { status: 400 });
    }
    
    const strategyKey = `dca:${strategyId}`;
    const strategyData = await env.DEVELOPERS_KV.get(strategyKey, 'json');
    
    if (!strategyData) {
      return Response.json({ error: 'Strategy not found' }, { status: 404 });
    }
    
    if (strategyData.developerId !== keyData.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update strategy status to withdrawn
    strategyData.status = 'withdrawn';
    await env.DEVELOPERS_KV.put(strategyKey, JSON.stringify(strategyData));
    
    return Response.json({
      success: true,
      message: 'Funds withdrawn successfully',
      withdrawnAmount: strategyData.remainingAmount,
      strategyId: parseInt(strategyId)
    });
    
  } catch (error: any) {
    console.error('DCA delete error:', error);
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
