const ApiError = require('../exceptions/api-error');
const TokenService = require('../service/token-service');
const UserService = require('../service/user-service')
module.exports = async function (req, res, next) {
    try {
        const {refreshToken} = req.cookies;
        const token = await TokenService.findToken(refreshToken);
        const user = await UserService.getUser(token.userId)
        if(!user.adminFlag){
            return next(ApiError.UnAdminError());
        }
        req.user = req.user;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
};