const { prisma } = require("../prisma/prisma-client");
const path = require("path");

class AuthorService{

    static async createAuthorFunc(image, avatarName, name, photoUrl, year, biography) {
        if (image) {
            // if (!/^image/.test(image.mimetype)) return res.status(400).json({ error: "Загружать можно только изображения до 10мб" });
            avatarName = `${name}.png`;
            photoUrl = `/uploads/${avatarName}`;
            image.mv(path.join(__dirname, '/../uploads', avatarName));
        }
        // console.log(name);
        const author = await prisma.author.create({
            data: {
                name,
                photoUrl,
                year,
                biography,
            },
        });
        return author;
    }
}

module.exports = AuthorService;