import { GoogleGenAI } from "@google/genai";

// Uses the GEMINI_API_KEY environment variable if apiKey not specified
const ai = new GoogleGenAI({});

export default ai;
