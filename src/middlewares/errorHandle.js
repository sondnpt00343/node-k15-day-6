// const { JsonWebTokenError } = require("jsonwebtoken");
const JsonWebTokenError = require("../classes/errors/JsonWebTokenError");
const constants = require("../configs/constants");
const isProduction = require("../utils/isProduction");

const { errorCodes } = constants;

function errorHandle(error, req, res, next) {
    if (error instanceof JsonWebTokenError) {
        return res.status(401).json({
            message: error.message || "Unauthorized.",
        });
    }

    if (error?.code === errorCodes.conflict) {
        return res.status(409).json({
            message: "Conflict.",
        });
    }

    res.status(500).json({
        error: !isProduction() ? error : "Server error.",
        message: !isProduction() ? String(error) : "Server error.",
    });
}

module.exports = errorHandle;
