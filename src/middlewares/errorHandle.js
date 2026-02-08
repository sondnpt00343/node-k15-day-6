const { JsonWebTokenError } = require("jsonwebtoken");
const constants = require("../configs/constants");
const isProduction = require("../utils/isProduction");

const { errorCodes, httpCodes, prismaCodes } = constants;

function errorHandle(error, req, res, next) {
    if (error instanceof JsonWebTokenError) {
        return res.status(httpCodes.unauthorized).json({
            message: error.message || "Unauthorized.",
        });
    }

    if (error?.code === errorCodes.conflict) {
        return res.status(httpCodes.conflict).json({
            message: "Conflict.",
        });
    }

    if (error?.code === prismaCodes.notFound) {
        return res.status(httpCodes.notFound).json({
            message: "Resource not found.",
        });
    }

    res.status(500).json({
        error: !isProduction() ? error : "Server error.",
        message: !isProduction() ? String(error) : "Server error.",
    });
}

module.exports = errorHandle;
