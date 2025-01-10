const ApiError = require('../exceptions/api-error');
const TokenService = require('../controllers/token-service');
module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        console.log(authorizationHeader);
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        console.log(accessToken);
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = TokenService.validateAccessToken(accessToken);
        console.log(userData);
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
};
