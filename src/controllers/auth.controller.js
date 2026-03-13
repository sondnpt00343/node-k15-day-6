const authService = require("@/services/auth.service");
const queueService = require("@/services/queue.service");
const { authError, http } = require("@/configs/constants");

function getAuthErrorStatus(errorCode) {
    const forbiddenCodes = [authError.emailNotVerified, authError.emailAlreadyVerified];
    return forbiddenCodes.includes(errorCode) ? http.forbidden : http.unauthorized;
}

const register = async (req, res) => {
    const { email, password } = req.body;
    const newUser = await authService.register(email, password);

    await queueService.push("sendVerificationEmail", newUser);

    res.success(newUser, http.created);
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"];

    const [data, error, code] = await authService.login(email, password, userAgent);

    if (error) {
        return res.error(error, getAuthErrorStatus(error));
    }

    res.success(data);
};

const getMe = async (req, res) => {
    const user = authService.getMe(req.auth.user);
    res.success(user);
};

const logout = async (req, res) => {
    const { accessToken, tokenPayload } = req.auth;
    await authService.logout(accessToken, tokenPayload);
    res.success(null, http.noContent);
};

const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;
    const userAgent = req.headers["user-agent"];

    const [data, error] = await authService.refreshToken(refresh_token, userAgent);

    if (error) {
        return res.error(error, http.unauthorized);
    }

    res.success(data);
};

const resendVerificationEmail = async (req, res) => {
    const { email, password } = req.body;
    const [, error] = await authService.resendVerificationEmail(email, password);

    if (error) {
        return res.error(error, getAuthErrorStatus(error));
    }

    res.success(null, 200, "Da gui lai email xac minh.");
};

const verifyEmail = async (req, res) => {
    const { token } = req.body;
    const [, error] = await authService.verifyEmail(token);

    if (error) {
        return res.error(authError.invalidToken, http.forbidden);
    }

    res.success(null, 200, "Verified.");
};

const changePassword = async (req, res) => {
    const { password, new_password } = req.body;
    const [, error] = await authService.changePassword(
        req.auth.user,
        password,
        new_password
    );

    if (error) {
        return res.error(error, http.unprocessableEntity);
    }

    res.success(null, 200, "Doi mat khau thanh cong.");
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    refreshToken,
    resendVerificationEmail,
    verifyEmail,
    changePassword,
};
