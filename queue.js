require("dotenv").config();
const jobs = require("./src/jobs");
const queueService = require("./src/services/queueService");
const sleep = require("./src/utils/sleep");
const { jobStatus } = require("./src/configs/constants");

(async () => {
    while (true) {
        // Do something...
        const firstJob = await queueService.getPendingJob();
        if (firstJob) {
            const { id, type, payload: jsonPayload } = firstJob;

            try {
                console.log(`Job "${type}" processing...`);

                const payload = JSON.parse(jsonPayload);

                // Update status: "inprogress"
                queueService.updateStatus(id, jobStatus.inprogress);

                const handle = jobs[type];
                if (handle) {
                    await handle(payload);
                } else {
                    console.log(`Chua co logic xu ly cho job: ${type}`);
                }

                // Update status: "completed"
                queueService.updateStatus(id, jobStatus.completed);

                console.log(`Job "${type}" processed.`);
            } catch (error) {
                // Update status: "failed"
                console.log(`Job "${type}" failed.`);
                queueService.updateStatus(id, jobStatus.failed);
            }
        }

        await sleep(3000);
    }
})();
