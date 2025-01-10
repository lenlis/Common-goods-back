class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.isActivated = false;
    }
}
module.exports = UserDto;