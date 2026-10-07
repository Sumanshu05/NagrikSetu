const { generateQueryResponse, analyzeComplaintText } = require("../services/geminiService");

/**
 * Endpoint to answer user civic queries via Google Gemini API
 */
exports.askAi = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || prompt.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Prompt is required and cannot be empty.",
            });
        }

        const aiReply = await generateQueryResponse(prompt);

        return res.status(200).json({
            success: true,
            message: "AI response generated successfully.",
            data: aiReply,
        });
    } catch (error) {
        const isOverloaded = error.status === 503 || error.status === 429;
        const statusCode = isOverloaded ? 503 : 500;
        const userMessage = isOverloaded
            ? "The AI assistant is temporarily busy due to high demand. Please wait a moment and try again."
            : error.message || "Failed to process query.";

        console.error("AI Controller askAi Error:", error.message || error);
        return res.status(statusCode).json({
            success: false,
            message: userMessage,
        });
    }
};


/**
 * Endpoint to auto-analyze citizen complaint text for department, urgency, and summary
 */
exports.analyzeComplaint = async (req, res) => {
    try {
        const { complaintText } = req.body;

        if (!complaintText || complaintText.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Complaint text is required.",
            });
        }

        const analysis = await analyzeComplaintText(complaintText);

        return res.status(200).json({
            success: true,
            message: "Complaint analyzed successfully.",
            data: analysis,
        });
    } catch (error) {
        console.error("AI Controller analyzeComplaint Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze complaint text.",
        });
    }
};
