const constants = {
    httpCodes: {
        success: 200,
        created: 201,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        conflict: 409,
        unprocessableEntity: 422,
    },
    errorCodes: {
        conflict: "ER_DUP_ENTRY",
    },
    prismaCodes: {
        notFound: "P2025",
    },
    jobStatus: {
        pending: "pending",
        inprogress: "inprogress",
        completed: "completed",
        failed: "failed",
    },
};

module.exports = constants;
