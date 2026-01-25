// Các hằng số dùng chung trong ứng dụng
const constants = {
    // HTTP status codes chuẩn
    httpCodes: {
        success: 200,      // Thành công
        created: 201,      // Tạo mới thành công
        unauthorized: 401, // Chưa xác thực (chưa đăng nhập hoặc token không hợp lệ)
        notFound: 404,     // Không tìm thấy tài nguyên
        conflict: 409,     // Xung đột (vd: email đã tồn tại)
    },
    
    // Mã lỗi database MySQL
    errorCodes: {
        conflict: "ER_DUP_ENTRY", // Lỗi duplicate entry (vd: insert email đã tồn tại)
    },
};

module.exports = constants;
