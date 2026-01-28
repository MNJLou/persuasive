export default async function handler(req, res) {
  console.log("🔥 /api/yoco/checkout HIT 🔥");
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount } = req.body || {};
  console.log("➡️ Amount received:", amount);

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    // Get the base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log("🔐 Using Yoco Secret Key:", process.env.YOCO_SECRET_KEY ? "✅ Found" : "❌ Missing");
    
    const yocoResponse = await fetch(
      "https://payments.yoco.com/api/checkouts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "ZAR",
          successUrl: `${baseUrl}?payment=success`,
          cancelUrl: `${baseUrl}?payment=cancelled`,
          failureUrl: `${baseUrl}?payment=failed`,
        }),
      }
    );

    const data = await yocoResponse.json();
    console.log("YOCO RAW RESPONSE:", JSON.stringify(data, null, 2));

    if (!yocoResponse.ok) {
      console.error("❌ Yoco API Error:", data);
      return res.status(yocoResponse.status).json(data);
    }

    console.log("✅ Checkout created successfully:", data.id);
    return res.status(200).json(data);
  } catch (err) {
    console.error("💥 CHECKOUT FAILED:", err);
    return res.status(500).json({ 
      error: "Checkout failed", 
      details: err.message 
    });
  }
}