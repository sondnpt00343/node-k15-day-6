const OpenAI = require("openai");
const { chatRole } = require("@/configs/constants");

const openaiClient = new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
});

class AIService {
    async completions(systemPrompt, messages = [], options = {}) {
        const { model = "anthropic/claude-haiku-4.5", responseFormat } =
            options;
        const body = {
            model,
            messages: [
                { role: chatRole.system, content: systemPrompt },
                ...messages,
            ],
        };
        if (responseFormat) body.response_format = responseFormat;

        const response = await openaiClient.chat.completions.create(body);
        return response.choices[0].message.content;
    }
}

module.exports = new AIService();
