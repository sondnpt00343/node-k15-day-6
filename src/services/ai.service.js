const OpenAI = require("openai");
const { chatRole } = require("@/configs/constants");

const openaiClient = new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: "https://ai-gateway.vercel.sh/v1",
});

class AIService {
    async completions(systemPrompt, messages = [], model = "anthropic/claude-haiku-4.5") {
        const response = await openaiClient.chat.completions.create({
            model,
            messages: [
                {
                    role: chatRole.system,
                    content: systemPrompt,
                },
                ...messages,
            ],
        });

        return response.choices[0].message.content;
    }
}

module.exports = new AIService();
