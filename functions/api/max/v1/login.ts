export async function onRequestPost(context: any) {
  const { request, env } = context;

  // Handle CORS
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

    // Get developer from KV by email
    const developerKey = `dev:${email}`;
    const developerData = await env.DEVELOPERS_KV.get(developerKey, 'json');

    if (!developerData) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Verify password (in production, compare hashed password)
    if (developerData.password !== password) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get MintMe contract address from env or KV
    const MINTME_CONTRACT = env.MINTME_CONTRACT_ADDRESS || "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";
    const MAX_PROGRAM_ID = env.MAX_PROGRAM_ID || "EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM";

    return new Response(
      JSON.stringify({
        success: true,
        email: developerData.email,
        apiKey: developerData.apiKey,
        apiSecret: developerData.apiSecret,
        mintmeContract: MINTME_CONTRACT,
        maxProgramId: MAX_PROGRAM_ID,
        message: "Login successful",
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
