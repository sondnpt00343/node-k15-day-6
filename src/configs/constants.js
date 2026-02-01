const constants = {
    httpCodes: {
        success: 200,
        created: 201,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        conflict: 409,
    },
    errorCodes: {
        conflict: "ER_DUP_ENTRY",
    },
};

module.exports = constants;
