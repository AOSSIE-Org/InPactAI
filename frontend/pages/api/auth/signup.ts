import type { NextApiRequest, NextApiResponse } from "next";

// Optional: Add rate limiting, logging, etc. here

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  try {
    // Forward the request to FastAPI backend
    const apiUrl = "https://in-pact-ai-1k47.vercel.app";
    const backendRes = await fetch(`${apiUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error: any) {
    // Optional: Add logging here
    console.error("Signup API error:", error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
}
