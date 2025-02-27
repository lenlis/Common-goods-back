class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован');
    }

    static UnAdminError() {
        return new ApiError(401, 'Пользователь не имеет прав администратора');
    }

    static UnActiveError() {
        return new ApiError(401, 'Почта пользователя не активирована');
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
}

module.exports = ApiError;
