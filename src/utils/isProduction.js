// Utility function: Kiểm tra ứng dụng đang chạy ở môi trường production hay không
// NODE_ENV thường được set bởi hosting provider hoặc trong script chạy app
function isProduction() {
    return process.env.NODE_ENV === "production";
}

module.exports = isProduction;
