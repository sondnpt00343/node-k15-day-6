const chatbotResponseFormat = {
    type: "json_schema",
    json_schema: {
        name: "fs_bash_manager",
        strict: true,
        schema: {
            type: "object",
            properties: {
                action: {
                    type: "string",
                    enum: ["read_file", "write_file", "bash", "respond"],
                },
                payload: {
                    type: "object",
                    properties: {
                        path: { type: ["string", "null"] },
                        content: { type: ["string", "null"] },
                        command: { type: ["string", "null"] },
                        message: { type: ["string", "null"] },
                    },
                    required: ["path", "content", "command", "message"],
                    additionalProperties: false,
                },
            },
            required: ["action", "payload"],
            additionalProperties: false,
        },
    },
};

module.exports = { chatbotResponseFormat };
