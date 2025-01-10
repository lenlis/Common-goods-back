const jwt = require('jsonwebtoken');
const { prisma } = require("../prisma/prisma-client");

class TokenService {
    static generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15s'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30s'});
        return {
            accessToken,
            refreshToken
        }
    }

    static validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    static validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    static async saveToken(userId, refreshToken) {
        let tokenData = await prisma.token.findUnique({where: {userId}});
        if (tokenData) {

            tokenData= await prisma.token.update({where:{id:tokenData.id},data:{refreshToken: refreshToken}});
            return tokenData;
        }
        const token = await prisma.token.create({data:{userId: userId, refreshToken}});
        return token;
    }

    static async removeToken(refreshToken) {
        let tokenData = await prisma.token.findFirst({where:{refreshToken}});
        tokenData = await prisma.token.delete({where:{id:tokenData.id}});
        return tokenData;
    }

    static async findToken(refreshToken) {
        const tokenData = await prisma.token.findFirst({where: {refreshToken}});
        return tokenData;
    }
}

module.exports = TokenService;
