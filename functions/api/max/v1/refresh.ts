// /api/max/v1/refresh.ts - Keep cache fresh
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const pools = await fetchAllPools();
    await env.DEVELOPERS_KV.put('all_pools', JSON.stringify(pools), { expirationTtl: 60 });
    
    return Response.json({ success: true, total: pools.total });
}
