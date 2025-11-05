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
    // Validate NEXT_PUBLIC_API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !/^https:\/\//.test(apiUrl)) {
      return res.status(500).json({
        detail:
          "NEXT_PUBLIC_API_URL is missing or not a valid HTTPS URL. Please contact the administrator.",
      });
    }
    // Forward the request to FastAPI backend
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
