const { GoogleGenAI } = require("@google/genai");

// Lazy initialization
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

// Models to try in order - if one is overloaded, fallback to next
const MODELS_TO_TRY = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001",
];

const SYSTEM_INSTRUCTION = `
You are NagrikSetu Assistant, an AI helper for citizens using NagrikSetu (Smart Citizen Grievance Portal).
Your primary role is to answer citizen queries regarding public civic issues, municipal department workflows (Roads & Bridges, Water Supply, Sanitation & Waste, Electricity, Public Health, Parks & Streetlights), and guide them on how to lodge complaints or check resolution statuses.
Rules:
1. Provide concise, clear, and structured responses using bullet points where helpful.
2. Be polite, empathetic, and professional at all times.
3. If a query is unrelated to civic grievances or municipal services, politely redirect the citizen to NagrikSetu's relevant features.
`;

/**
 * Sleep helper for retry delays
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try generating content with automatic model fallback and retry on 503
 */
async function generateWithFallback(buildPayload) {
    const ai = getAiClient();

    for (const model of MODELS_TO_TRY) {
        // Retry up to 2 times per model on 503
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const payload = buildPayload(model);
                const response = await ai.models.generateContent(payload);
                console.log(`[AI] Success with model: ${model} (attempt ${attempt + 1})`);
                return response.text;
            } catch (error) {
                const status = error.status || error.code;
                const isOverloaded = status === 503 || status === 429;
                const isNotFound = status === 404;

                if (isNotFound) {
                    // Model doesn't exist for this key – skip to next model immediately
                    console.warn(`[AI] Model ${model} not available (404), trying next...`);
                    break;
                }

                if (isOverloaded) {
                    if (attempt === 0) {
                        // Wait 2 seconds then retry same model once
                        console.warn(`[AI] Model ${model} overloaded (${status}), retrying in 2s...`);
                        await sleep(2000);
                        continue;
                    } else {
                        // Already retried - move to next model
                        console.warn(`[AI] Model ${model} still overloaded after retry, trying next model...`);
                        break;
                    }
                }

                // Non-recoverable error - throw immediately
                throw error;
            }
        }
    }

    throw new Error("All Gemini models are currently unavailable. Please try again in a few moments.");
}

/**
 * Generate AI response for citizen query
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function generateQueryResponse(userPrompt) {
    try {
        return await generateWithFallback((model) => ({
            model,
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.5,
                maxOutputTokens: 800,
            },
        }));
    } catch (error) {
        console.error("Gemini Service generateQueryResponse Error:", error.message || error);
        throw error;
    }
}

/**
 * Automatically analyze complaint text to extract category, urgency, title, and suggested action
 * @param {string} complaintText
 * @returns {Promise<Object>}
 */
async function analyzeComplaintText(complaintText) {
    const prompt = `
Analyze the following citizen complaint and return ONLY a valid JSON object with the following fields:
- "suggestedTitle": A concise 5-8 word title.
- "department": One of ["Roads & Bridges", "Water Supply", "Sanitation & Waste", "Electricity", "Streetlights", "Public Health", "Other"].
- "urgency": One of ["Low", "Medium", "High", "Critical"].
- "summary": A brief 2-sentence summary of the issue.
- "recommendedAction": Immediate step the municipal officer should take.

Complaint: "${complaintText}"
`;

    try {
        const text = await generateWithFallback((model) => ({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.2,
            },
        }));

        // Extract JSON from response (model may wrap it in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not extract JSON from AI response.");
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Service analyzeComplaintText Error:", error.message || error);
        throw error;
    }
}

module.exports = {
    generateQueryResponse,
    analyzeComplaintText,
};
