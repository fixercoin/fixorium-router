export async function onRequestPost(context: any) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if user already exists
    const existingUser = await env.DEVELOPERS_KV.get(`dev:${email}`, 'json');
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already registered" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const apiKey = `max_${crypto.randomUUID().replace(/-/g, '')}`;
    const apiSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const developerId = crypto.randomUUID();

    const developer = {
      id: developerId,
      email,
      password, // In production, hash this!
      apiKey,
      apiSecret,
      createdAt: Date.now(),
      status: 'active',
    };

    // Store in KV
    await env.DEVELOPERS_KV.put(`dev:${email}`, JSON.stringify(developer));
    await env.DEVELOPERS_KV.put(`key:${apiKey}`, developerId);

    const MINTME_CONTRACT = env.MINTME_CONTRACT_ADDRESS || "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";
    const MAX_PROGRAM_ID = env.MAX_PROGRAM_ID || "EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM";

    return new Response(
      JSON.stringify({
        success: true,
        apiKey,
        apiSecret,
        mintmeContract: MINTME_CONTRACT,
        maxProgramId: MAX_PROGRAM_ID,
        message: "Registration successful",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
