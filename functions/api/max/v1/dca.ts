import { Connection, PublicKey } from '@solana/web3.js';

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
    const { inputMint, outputMint, totalAmount, amountPerCycle, cycleSeconds, totalCycles, userPublicKey, network = 'devnet' } = params;
    
    if (!inputMint || !outputMint || !totalAmount || !amountPerCycle || !cycleSeconds || !totalCycles || !userPublicKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const strategyId = Date.now();
    const totalDuration = cycleSeconds * totalCycles;
    const expectedEnd = Date.now() + (totalDuration * 1000);
    const fee = totalAmount * 0.0001;
    
    const [strategyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('dca'), Buffer.from(strategyId.toString())],
      new PublicKey(env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM')
    );
    
    const strategy = {
      strategyId,
      developerId: keyData.id,
      inputMint,
      outputMint,
      totalAmount,
      amountPerCycle,
      cycleSeconds,
      totalCycles,
      completedCycles: 0,
      remainingAmount: totalAmount,
      status: 'active',
      nextExecution: Date.now() + (cycleSeconds * 1000),
      expectedEnd,
      createdAt: Date.now(),
      strategyPda: strategyPda.toString(),
      fee
    };
    
    await env.DEVELOPERS_KV.put(`dca:${strategyId}`, JSON.stringify(strategy));
    
    const userStrategiesKey = `user:${keyData.id}:dca`;
    const existingStrategies = await env.DEVELOPERS_KV.get(userStrategiesKey);
    const strategiesList = existingStrategies ? JSON.parse(existingStrategies) : [];
    strategiesList.push(strategyId);
    await env.DEVELOPERS_KV.put(userStrategiesKey, JSON.stringify(strategiesList));
    
    return Response.json({
      success: true,
      strategyId,
      strategyPda: strategyPda.toString(),
      inputMint,
      outputMint,
      totalAmount,
      amountPerCycle,
      cycleSeconds,
      totalCycles,
      expectedEnd: new Date(expectedEnd).toISOString(),
      fee: {
        bps: 1,
        percentage: '0.01%',
        amount: fee
      }
    });
    
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
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
    const strategyId = url.searchParams.get('strategyId');
    
    if (strategyId) {
      const strategy = await env.DEVELOPERS_KV.get(`dca:${strategyId}`, 'json');
      if (!strategy) {
        return Response.json({ error: 'Strategy not found' }, { status: 404 });
      }
      if (strategy.developerId !== keyData.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return Response.json({ strategy });
    } else {
      const userStrategiesKey = `user:${keyData.id}:dca`;
      const strategiesList = await env.DEVELOPERS_KV.get(userStrategiesKey);
      const strategyIds = strategiesList ? JSON.parse(strategiesList) : [];
      const strategies = [];
      for (const id of strategyIds) {
        const strategy = await env.DEVELOPERS_KV.get(`dca:${id}`, 'json');
        if (strategy) strategies.push(strategy);
      }
      return Response.json({ strategies });
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
    const strategyId = url.searchParams.get('strategyId');
    
    if (!strategyId) {
      return Response.json({ error: 'Missing strategyId' }, { status: 400 });
    }
    
    const strategy = await env.DEVELOPERS_KV.get(`dca:${strategyId}`, 'json');
    if (!strategy) {
      return Response.json({ error: 'Strategy not found' }, { status: 404 });
    }
    if (strategy.developerId !== keyData.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    strategy.status = 'withdrawn';
    await env.DEVELOPERS_KV.put(`dca:${strategyId}`, JSON.stringify(strategy));
    
    return Response.json({ success: true, message: 'Funds withdrawn' });
    
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
