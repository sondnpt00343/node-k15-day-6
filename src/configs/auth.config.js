const authConfig = {
    jwtSecret: process.env.AUTH_JWT_SECRET,
    accessTokenTTL: +process.env.AUTH_ACCESS_TOKEN_TTL || 3600,
    saltRounds: +process.env.AUTH_SALT_ROUNDS || 10,
};

module.exports = authConfig;
