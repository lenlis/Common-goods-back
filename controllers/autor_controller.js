const { prisma } = require("../prisma/prisma-client");
const path = require("path");
const fs = require('fs');
const AuthorService = require('../service/author_service')

const AuthorController = {

    getAuthors: async (req, res) =>{
        let textId = req.query.textId;
        let word = req.query.word;
        let autors;
        try{
            if(textId == undefined && word == undefined){
                autors = await prisma.author.findMany(
                    {include:{texts:true}}
                    );
            }
            else
            {
                if (word != undefined && textId != undefined){
                    autors = await prisma.author.findMany({
                        where:{
                            AND:[
                                {
                                    texts:{
                                        id: textId
                                    }

                                },
                                {
                                    name:
                                    {
                                        contains: word, 
                                        mode: 'insensitive'
                                    },
                                    
                                }
                            ],
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
                else if(word != undefined){
                    autors = await prisma.author.findMany({
                        where:{
                             name:{
                                contains: word, 
                                mode: 'insensitive'
                            },          
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
                else{
                    autors = await prisma.author.findMany({
                        where:{
                            texts:{
                                id: textId
                            }
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
            }
            if(!autors){
                res.status(404).json({ error: ('Не найдены авторы')});
            }
            res.json(autors);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов' });
        }
    },

    getAuthorsById: async (req, res) =>{
        const { id } = req.params;
        let autor;
        try{
            console.log(id)
            autor = await prisma.author.findUnique({
                where:{id},
                include:{
                    texts: true
                }
            });
            console.log(id)
            if(!autor){
                res.status(404).json({ error: ('Не найдены авторы по id')});
            }
            res.json(autor);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    createAuthor: async (req, res) =>{
        let name, year, biography, image;
        name = req.body.name;
        year = req.body.year;
        biography = req.body.biography;
        const files = req.files;
        if(files){
            image = files.image
        }
        console.log(image)
        let photoUrl = '/images/authorPlaceHolder.png';
        let avatarName;
        try{

            let author;
            author = await AuthorService.createAuthorFunc(image, avatarName, name, photoUrl, year, biography);
            // console.log(author);
            res.json(author);
        } catch (error) {
            console.error("Error create author:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    updateAuthor: async (req, res) =>{
        let id, name, year, biography, image;
        id = req.body.id;
        name = req.body.name;
        year = req.body.year;
        biography = req.body.biography;
        const files = req.files;
        if(files){
            image = files.image
        }
        // console.log(image)
        let avatarName;
        try {
            const tryAuthor = await prisma.author.findUnique({ where: { id: id } });
            photoUrl = tryAuthor.photoUrl;
            if (image) {
                fs.unlink(path.join(__dirname, ('/..' + tryAuthor.photoUrl)), (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                // if (!/^image/.test(image.mimetype)) return res.status(400).json({ error: "Загружать можно только изображения до 10мб" });
                avatarName = `${name}.png`;
                photoUrl = `/uploads/${avatarName}`;
                image.mv(path.join(__dirname, '/../uploads', avatarName));
            }
            // console.log(name);
            const author = await prisma.author.update({
                where: {
                    id: id
                },
                data: {
                    name,
                    photoUrl,
                    year,
                    biography,
                },
            });
            // console.log(author);
            res.json(author);
        } catch (error) {
            console.error("Error update author:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    deleteAuthor: async (req, res) =>{
        let i;
        let id;
        let author
        id = req.body.id;
        try{
            author = await prisma.author.findUnique({ where: { id }, include:{translations:true, translationConnections:true} });
            for (i = 0; i < author.translations.length; i++){
                await prisma.connectionAuthorText.delete({where:{ id: author.translations[i].id}})
            }
            for (i = 0; i < author.translationConnections.length; i++){
                console.log(author.translationConnections[i]);
                await prisma.translation.delete({where:{id: author.translationConnections[i].id}})
            }
        
            author = await prisma.author.delete({where:{id}});
            // console.log(author);
            res.json(author);
        } catch (error) {
            console.error("Error delete author:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
};

module.exports = AuthorController;

// async function createAuthorFunc(image, avatarName, name, photoUrl, year, biography) {
//     if (image) {
//         // if (!/^image/.test(image.mimetype)) return res.status(400).json({ error: "Загружать можно только изображения до 10мб" });
//         avatarName = `${name}.png`;
//         photoUrl = `/uploads/${avatarName}`;
//         image.mv(path.join(__dirname, '/../uploads', avatarName));
//     }
//     // console.log(name);
//     const author = await prisma.author.create({
//         data: {
//             name,
//             photoUrl,
//             year,
//             biography,
//         },
//     });
//     return { author, avatarName, photoUrl };
// }
