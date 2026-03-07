const { JsonWebTokenError } = require("jsonwebtoken");
const { authError, http, prisma } = require("@/configs/constants");
const isProduction = require("@/utils/isProduction");

function errorHandle(error, req, res, next) {
    if (error instanceof JsonWebTokenError) {
        return res.error(authError.unauthorized, http.unauthorized);
    }

    if (error?.code === prisma.uniqueViolation) {
        return res.error(authError.conflict, http.conflict);
    }

    if (error?.code === prisma.notFound) {
        return res.error(authError.NOT_FOUND, http.notFound);
    }

    const message = !isProduction() ? String(error) : authError.serverError;
    res.error(message, 500);
}

module.exports = errorHandle;
