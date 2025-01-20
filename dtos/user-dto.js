class UserDto {
    email;
    id;
    isActivated;
    adminFlag;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.isActivated = model.isActivated;
        this.adminFlag = model.adminFlag;
    }
}
module.exports = UserDto;