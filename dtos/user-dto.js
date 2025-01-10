class UserDto {
    email;
    id;
    isActivated;

    constructor() {
        this.email = "model.email";
        this.id = "model.id";
        this.isActivated = false;
    }
}
module.exports = UserDto;