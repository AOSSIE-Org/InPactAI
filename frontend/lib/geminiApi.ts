// Gemini text generation API integration
// Calls backend /generate endpoint securely
export async function generateGeminiText(prompt: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set in environment.");
  }
  try {
    const res = await fetch(`${apiUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(`Gemini API call failed: ${err.message}`);
  }
}
