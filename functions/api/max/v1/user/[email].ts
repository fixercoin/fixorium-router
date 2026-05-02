export async function onRequestGet(context: any) {
  const { request, env, params } = context;
  const email = params.email;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const developerKey = `dev:${email}`;
    const developerData = await env.DEVELOPERS_KV.get(developerKey, 'json');

    if (!developerData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

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
