const { GoogleGenAI } = require("@google/genai");

// Lazy initialization or fallback when key is not set
let aiClient = null;

function getAiClient() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
}

const SYSTEM_INSTRUCTION = `
You are NagrikSetu Assistant, an AI helper for citizens using NagrikSetu (Smart Citizen Grievance Portal).
Your primary role is to answer citizen queries regarding public civic issues, municipal department workflows (Roads & Bridges, Water Supply, Sanitation & Waste, Electricity, Public Health, Parks & Streetlights), and guide them on how to lodge complaints or check resolution statuses.
Rules:
1. Provide concise, clear, and structured responses using bullet points where helpful.
2. Be polite, empathetic, and professional at all times.
3. If a query is unrelated to civic grievances or municipal services, politely redirect the citizen to NagrikSetu's relevant features.
`;

/**
 * Generate AI response for citizen query
 * @param {string} userPrompt 
 * @returns {Promise<string>}
 */
async function generateQueryResponse(userPrompt) {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: [
                { role: "user", parts: [{ text: userPrompt }] }
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.5,
                maxOutputTokens: 800,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Service generateQueryResponse Error:", error);
        throw error;
    }
}

/**
 * Automatically analyze complaint text to extract category, urgency, title, and suggested action
 * @param {string} complaintText 
 * @returns {Promise<Object>} JSON object with categorized details
 */
async function analyzeComplaintText(complaintText) {
    try {
        const ai = getAiClient();
        const prompt = `
Analyze the following citizen complaint and return ONLY a valid JSON object with the following fields:
- "suggestedTitle": A concise 5-8 word title.
- "department": One of ["Roads & Bridges", "Water Supply", "Sanitation & Waste", "Electricity", "Streetlights", "Public Health", "Other"].
- "urgency": One of ["Low", "Medium", "High", "Critical"].
- "summary": A brief 2-sentence summary of the issue.
- "recommendedAction": Immediate step the municipal officer should take.

Complaint: "${complaintText}"
`;

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini Service analyzeComplaintText Error:", error);
        throw error;
    }
}

module.exports = {
    generateQueryResponse,
    analyzeComplaintText,
};
