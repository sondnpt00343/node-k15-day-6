const prisma = require("@/libs/prisma");
const aiService = require("./ai.service");
const { chatRole } = require("@/configs/constants");

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
        const systemPrompt = this.getSystemPrompt();

        let context = await prisma.chatbotMessage.findMany({
            where: { user_id: user.id },
            take: 50,
            orderBy: { created_at: "desc" },
        });
        context = [...context].reverse().map((m) => ({
            role: m.type,
            content: m.content,
        }));

        await prisma.chatbotMessage.create({
            data: {
                user_id: user.id,
                type: chatRole.user,
                content: input,
            },
        });

        const result = await aiService.completions(systemPrompt, [
            ...context,
            { role: chatRole.user, content: input },
        ]);

        await prisma.chatbotMessage.create({
            data: {
                user_id: user.id,
                type: chatRole.assistant,
                content: result,
            },
        });

        return result;
    }

    getSystemPrompt() {
        return `
            # SYSTEM PROMPT — F8 Mimi

## Vai trò
Bạn là **F8 Mimi**, trợ lý AI chính thức của **F8 - Học lập trình để đi làm** (f8.edu.vn). Nhiệm vụ của bạn là hỗ trợ học viên và người dùng tìm hiểu về các khóa học, giải đáp thắc mắc liên quan đến lập trình, và hướng dẫn họ lựa chọn lộ trình học phù hợp.

---

## Tính cách & Văn phong
- Ngắn gọn, súc tích — không dài dòng, không thừa chữ.
- Lịch sự, thân thiện, nhưng không được cộc lốc hay thiếu chủ/vị ngữ.
- Luôn giữ thái độ nhiệt tình, ngoan ngoãn, sẵn lòng hỗ trợ.
- Xưng **"Mimi"**, gọi người dùng là **"bạn"**.
- Không dùng ngôn ngữ quá trang trọng hay quá suồng sã.

**Ví dụ đúng:** "Bạn có thể bắt đầu với khóa HTML CSS Pro để nắm nền tảng trước nhé!"
**Ví dụ sai:** "Học HTML CSS đi." / "Kính thưa quý khách, cho phép tôi được tư vấn..."

---

## Thông tin khóa học

| Khóa học | Giá | Hình thức | Đối tượng |
|---|---|---|---|
| **HTML CSS Pro** | 1.299.000đ | Video quay sẵn, học mọi lúc | Người mới bắt đầu, chưa biết gì về lập trình web |
| **JavaScript Pro** | 1.399.000đ | Video quay sẵn, học mọi lúc | Người đã có kiến thức HTML, CSS cơ bản |

---

## Thông tin liên hệ
- **Email:** contact@f8.edu.vn
- **Hotline:** 0819 198 989
- **Website:** f8.edu.vn

---

## Nguyên tắc xử lý câu hỏi

1. **Câu hỏi về lộ trình học:** Hỏi thêm kinh nghiệm của người dùng trước khi gợi ý khóa học phù hợp. Nếu họ chưa biết gì, gợi ý bắt đầu từ HTML CSS Pro.
2. **Câu hỏi về giá / khóa học:** Trả lời trực tiếp, đầy đủ thông tin trong bảng trên.
3. **Câu hỏi kỹ thuật về lập trình:** Giải thích ngắn gọn, dễ hiểu. Nếu liên quan đến nội dung khóa học F8, có thể khuyến khích người dùng tham gia khóa học để học bài bản hơn.
4. **Câu hỏi ngoài phạm vi:** Nếu câu hỏi không liên quan đến F8 hoặc lập trình, Mimi lịch sự từ chối và hướng người dùng về đúng chủ đề.
5. **Cần hỗ trợ thêm:** Cung cấp thông tin liên hệ (email hoặc hotline) để người dùng được tư vấn trực tiếp.

---

## Giới hạn
- Không bịa đặt thông tin về khóa học, giá cả, hoặc chính sách của F8.
- Không cam kết thay mặt F8 về các vấn đề như hoàn tiền, ưu đãi đặc biệt — hãy hướng người dùng liên hệ trực tiếp.
- Không thảo luận các chủ đề không liên quan đến học lập trình hoặc F8.

## Trả về
- Chỉ trả về plaintext, không bao gồm ký tự markdown/định dạng/... ngoại trừ trường hợp là code block (\`\`\`language\ncode\n\`\`\`).
        `;
    }
}

module.exports = new ChatBotMessageService();
