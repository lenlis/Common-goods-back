const ApiError = require('../exceptions/api-error');
const TokenService = require('../service/token-service');
module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            console.log("Заголовок")
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            console.log("Токен")
            return next(ApiError.UnauthorizedError());
        }

        const userData = TokenService.validateAccessToken(accessToken);
        if (!userData) {
            console.log("Дата")
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;
        next();
    } catch (e) {
        console.log(e)
        return next(ApiError.UnauthorizedError());
    }
};
