const { JsonWebTokenError } = require("jsonwebtoken");
const constants = require("../configs/constants");
const isProduction = require("../utils/isProduction");

const { errorCodes } = constants;

// Middleware xử lý lỗi tập trung
// Bắt mọi lỗi từ các route và middleware phía trước
// Tham số error là bắt buộc để Express nhận biết đây là error handler
function errorHandle(error, req, res, next) {
    // Xử lý lỗi JWT (token không hợp lệ, hết hạn, sai format, v.v)
    if (error instanceof JsonWebTokenError) {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }

    // Xử lý lỗi duplicate entry từ MySQL (vd: email đã tồn tại)
    if (error?.code === errorCodes.conflict) {
        return res.status(409).json({
            message: "Conflict.",
        });
    }

    // Xử lý các lỗi khác (lỗi không mong muốn)
    // Trong môi trường dev: hiển thị chi tiết lỗi để debug
    // Trong môi trường production: chỉ hiển thị message chung để bảo mật
    res.status(500).json({
        error: !isProduction() ? error : "Server error.",
        message: !isProduction() ? String(error) : "Server error.",
    });
}

module.exports = errorHandle;
