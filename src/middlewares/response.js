function responseMiddleware(req, res, next) {
    res.success = function (data, statusCode = 200, message) {
        if (statusCode === 204) {
            return res.status(204).send();
        }
        const body = { success: true };
        if (data !== undefined && data !== null) body.data = data;
        if (message) body.message = message;
        return res.status(statusCode).json(body);
    };

    res.error = function (message = "Server error", statusCode = 500) {
        return res.status(statusCode).json({ success: false, message });
    };

    next();
}

module.exports = responseMiddleware;
