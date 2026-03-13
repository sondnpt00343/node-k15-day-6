const path = require("path");
const { exec } = require("child_process");
const fs = require("fs").promises;
const util = require("util");
const execAsync = util.promisify(exec);

const prisma = require("@/libs/prisma");
const aiService = require("./ai.service");
const { chatbotResponseFormat } = require("@/configs/ai.config");
const { chatRole } = require("@/configs/constants");

const WORKSPACE = path.resolve(process.cwd());
const PLATFORM = { darwin: "macOS", win32: "Windows", linux: "Linux" }[process.platform] ?? process.platform;
const BASH_WHITELIST = process.platform === "win32"
    ? /^(dir|cd|ver|whoami)(\s|$)/i
    : /^(ls|pwd|uname|df|whoami)(\s|$)/;
const MAX_TURNS = 50;
const CONTEXT_LIMIT = 50;

class ChatBotMessageService {
    async getMessages(user, { before, limit = 20 }) {
        const where = { user_id: user.id };
        if (before) {
            where.id = { lt: parseInt(before) };
        }

        // Fetch one extra to know if there are more pages
        const rows = await prisma.chatbotMessage.findMany({
            where,
            take: limit + 1,
            orderBy: { id: "desc" },
        });

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;

        // Return in ascending order (oldest → newest) for display
        items.reverse();

        return {
            messages: items.map((m) => ({
                id: m.id,
                role: m.type,
                content: m.content,
            })),
            hasMore,
            // cursor = id of the oldest message in this batch (for next page)
            cursor: hasMore ? items[0].id : null,
        };
    }

    async chat(user, input) {
        const context = await this.buildContext(user.id);
        const systemPrompt = this.getSystemPrompt();
        await this.saveMessage(user.id, chatRole.user, input);

        const toolHistory = [];
        let response = "";

        for (let i = 0; i < MAX_TURNS; i++) {
            const messages = [...context, ...toolHistory];
            if (i === 0) messages.push({ role: chatRole.user, content: input });

            const result = await this.think(systemPrompt, messages);
            toolHistory.push({ role: chatRole.assistant, content: JSON.stringify(result) });

            const { action, payload } = result;
            if (action === "respond") {
                response = payload?.message ?? "";
                break;
            }

            const toolOutput = await this.runTool(action, payload);
            toolHistory.push({ role: chatRole.user, content: toolOutput });
        }

        const finalResponse = response || "Unable to complete. Please try again.";
        await this.saveMessage(user.id, chatRole.assistant, finalResponse);
        return finalResponse;
    }

    async buildContext(userId) {
        const rows = await prisma.chatbotMessage.findMany({
            where: { user_id: userId },
            take: CONTEXT_LIMIT,
            orderBy: { created_at: "desc" },
        });
        return rows.reverse().map((m) => ({ role: m.type, content: m.content }));
    }

    saveMessage(userId, role, content) {
        return prisma.chatbotMessage.create({
            data: { user_id: userId, type: role, content },
        });
    }

    async runTool(action, payload) {
        const handlers = {
            bash: () => this.runCommand(payload?.command).then((out) => `Command output: ${out}`),
            read_file: () => this.readFile(payload?.path).then((c) => `File content of ${payload?.path}: ${c}`),
            write_file: () => this.writeFile(payload?.path, payload?.content ?? ""),
        };
        const handler = handlers[action];
        return handler ? handler() : "Error: Unknown action. Use respond to reply.";
    }

    resolvePath(filePath) {
        if (!filePath || typeof filePath !== "string") return null;
        const full = path.resolve(WORKSPACE, filePath);
        const base = path.resolve(WORKSPACE);
        if (full !== base && !full.startsWith(base + path.sep)) return null;
        return full;
    }

    async readFile(filePath) {
        const full = this.resolvePath(filePath);
        if (!full) return "Error: Invalid path";
        try {
            return await fs.readFile(full, "utf8");
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    async writeFile(filePath, content) {
        const full = this.resolvePath(filePath);
        if (!full) return "Error: Invalid path";
        try {
            await fs.writeFile(full, content);
            return `File written successfully: ${filePath}`;
        } catch (err) {
            return `Error: ${err.message}`;
        }
    }

    async think(systemPrompt, messages) {
        const raw = await aiService.completions(systemPrompt, messages, {
            responseFormat: chatbotResponseFormat,
        });
        try {
            return JSON.parse(raw);
        } catch {
            throw new Error("Invalid AI response format");
        }
    }

    getSystemPrompt() {
        return `# F8 Mimi — AI Coding Agent

## Môi trường
- OS: ${PLATFORM}
- bash: ${process.platform === "win32" ? "dùng dir, cd, ver, whoami (cmd)" : "dùng ls, pwd, uname, df, whoami"}

## Vai trò
Bạn là AI agent hỗ trợ lập trình trong môi trường workspace. Bạn có quyền:
- Đọc/ghi file trong workspace
- Chạy lệnh hệ thống (ls, pwd, uname, df, whoami)
- Trả lời câu hỏi về code, khóa học, lộ trình học lập trình

## Nguyên tắc
1. Chỉ thực hiện đúng yêu cầu user, không làm thừa
2. Path luôn tương đối với workspace (vd: package.json, src/index.js)
3. Khi dùng read_file: trả nội dung đầy đủ, format code đúng (vd: \`\`\`js cho file .js)
4. Khi dùng bash: ${process.platform === "win32" ? "chỉ dùng dir, cd, ver, whoami" : "chỉ dùng ls, pwd, uname, df, whoami"} — không đọc file qua bash
5. Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt

## Tools
- read_file: { "path": "<path>" }
- write_file: { "path": "<path>", "content": "<content>" }
- bash: { "command": "<${process.platform === "win32" ? "dir|cd|ver|whoami" : "ls|pwd|uname|df|whoami"}>" }
- respond: { "message": "<nội dung trả lời>" } — dùng khi kết thúc

## Output format
Luôn trả JSON thuần: { "action": "<tool>", "payload": {...} }
Không bọc \`\`\`json, không thêm text. Escape ký tự đặc biệt trong message (\\\\n, \\\\").`;
    }

    async runCommand(command) {
        if (
            !command ||
            typeof command !== "string" ||
            !BASH_WHITELIST.test(command.trim())
        ) {
            return "Error: Command not allowed";
        }
        try {
            const { stdout } = await execAsync(command.trim(), {
                cwd: WORKSPACE,
            });
            return stdout.trim();
        } catch (err) {
            return err.message;
        }
    }
}

module.exports = new ChatBotMessageService();
