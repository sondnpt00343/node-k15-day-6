const prisma = require("@/libs/prisma");
const { jobStatus } = require("@/configs/constants");

class QueueService {
    async push(type, payload) {
        const jsonPayload = JSON.stringify(payload);
        await prisma.queue.create({
            data: { type, payload: jsonPayload },
        });
    }

    async getPendingJob() {
        const job = await prisma.queue.findFirst({
            where: { status: jobStatus.pending },
            orderBy: { id: "asc" },
        });
        return job;
    }

    async updateStatus(id, status, info) {
        await prisma.queue.update({
            where: { id },
            data: { status, ...(info != null && { info }) },
        });
    }
}

module.exports = new QueueService();
