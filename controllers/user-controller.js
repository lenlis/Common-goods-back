const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error').default;
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const UserDto = require('../dtos/user-dto');
const { sign, verify } = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const UserController =  {
    registration:  async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await UserService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    },

    login: async (req, res, next) => {
        try {
            const {email, password} = req.body;
            const userData = await UserService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    },

    logout: async (req, res, next) => {
        try {
            const {refreshToken} = req.cookies;
            const token = await UserService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    },

    activate: async (req, res, next) => {
        try {
            const activationLink = req.params.link;
            await UserService.activate(activationLink);
            return res.redirect(env("CLIENT_URL"));
        } catch (e) {
            next(e);
        }
    },

    refresh: async (req, res, next) => {
        try {
            const {refreshToken} = req.cookies;
            const userData = await UserService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    },

    getUsers: async (req, res, next) => {
        try {
            const users = await UserService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    },
};

const UserService = {
    registration: async  (email, password) => {
        const candidate = await prisma.user.findUnique({where: {email}});
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await prisma.user.create({data:{email, password: hashPassword, activationLink}});
        let Mail = new MailService();
        await Mail.sendActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);

        const userDto = new UserDto(); // id, email, isActivated
        userDto.email = user.email;
        userDto.id = user.id;
        userDto.isActivated = user.isActivated;
        const tokens = TokenService.generateTokens({...userDto});
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    },

    activate: async (activationLink) => {
        const user = await prisma.user.findUnique({where: {activationLink}});
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    },

    login: async (email, password) => {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }
        const isPassEquals = await compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    },

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);
        return token;
    },

    async refresh(refreshToken) {
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

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    },

    async getAllUsers() {
        const users = await prisma.user.findMany({});
        return users;
    }
}

const TokenService = {
    generateTokens(payload) {
        const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15s'});
        const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30s'});
        return {
            accessToken,
            refreshToken
        }
    },

    validateAccessToken(token) {
        try {
            const userData = verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    },

    validateRefreshToken(token) {
        try {
            const userData = verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    },

    async saveToken(userId, refreshToken) {
        const tokenData = await prisma.token.findUnique({where: {userId}});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await prisma.token.create({data:{userId: userId, refreshToken}});
        return token;
    },

    async removeToken(refreshToken) {
        const tokenData = await prisma.token.delete({where:{refreshToken}});
        return tokenData;
    },

    async findToken(refreshToken) {
        const tokenData = await prisma.token.findUnique({where: {refreshToken}});
        return tokenData;
    }
}

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        })
    }
}

module.exports = UserController;
