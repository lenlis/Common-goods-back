const { prisma } = require("../prisma/prisma-client");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const UserDto = require('../dtos/user-dto');
const TokenService = require('../service/token-service');
const MailService = require('../service/mail-service');
const ApiError = require('../exceptions/api-error');

class UserService {
    static async registration(email, password){
        console.log(password);
        console.log(email);
        const candidate = await prisma.user.findUnique({where: {email}});
        console.log(candidate);
        if (candidate != undefined) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf
        const user = await prisma.user.create({
            data:{
                email, 
                password: hashPassword, 
                activLink
            }
        });
        let Mail = new MailService();
        await Mail.sendActivationMail(email, `${process.env.API_URL}/activate/${activLink}`);
        const tokens = TokenService.generateTokens({...user});
        await TokenService.saveToken(user.id, tokens.refreshToken);

        return {...tokens, user}
    }

    static async  activate(activationLink){
        const user = await prisma.user.findUnique({where: {activationLink}});
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }

    static async login(email, password){
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    static async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    static async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await prisma.user.findUnique({where: {id: userData.id}});
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});
        console.log(userDto.id);
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    static async getAllUsers() {
        const users = await prisma.user.findMany({});
        return users;
    }

    static async getUser(id){
        const user = await prisma.user.findUnique({where:{id}});
        return user;
    }

}

module.exports = UserService;