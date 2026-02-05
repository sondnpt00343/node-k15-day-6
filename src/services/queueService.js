const db = require("../../db");
const { jobStatus } = require("../configs/constants");

class QueueService {
    async push(type, payload) {
        const jsonPayload = JSON.stringify(payload);
        await db.query("insert into queues (type, payload) values (?, ?)", [
            type,
            jsonPayload,
        ]);
    }

    async getPendingJob() {
        const [rows] = await db.query(
            "select * from queues where status = ? order by id limit 1",
            [jobStatus.pending],
        );
        const firstJob = rows[0];
        return firstJob ?? null;
    }

    async updateStatus(id, status, info) {
        await db.query("update queues set status = ?, info = ? where id = ?", [
            status,
            info,
            id,
        ]);
    }
}

module.exports = new QueueService();
