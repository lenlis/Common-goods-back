const { prisma } = require("../prisma/prisma-client");



const TextController = {

    getTextsSearch: async (req, res) =>{
        let authorId = req.query.authorId;
        let wordId = req.query.wordId;
        let word = req.query.word;
        let texts;

        try{
            if(authorId == undefined && wordId == undefined && word == undefined){
                texts = await prisma.text.findMany({
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
                res.json(texts);
                return;

            }
            if((authorId != undefined || wordId != undefined) && word == undefined){
                texts = await prisma.text.findMany({
                    where:{ OR:[
                        {
                            authorId: {equals: authorId},
                        },
                        {
                            word:{
                                some:{
                                    wordId:{equals:wordId},
                                }
                            }
                        },
                    ]},
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
            }
            else{
                texts = await prisma.text.findMany({
                    where:{ OR:[
                        {
                            title:{
                                contains: word, 
                                mode: 'insensitive'
                            }
                        },
                        {
                            titleRU:{
                                contains: word, 
                                mode: 'insensitive'
                            }
                        }
                        ],
                    },
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
            }

            if(!texts){
                res.status(404).json({ error: ('Не найден текст по автору')});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    getTextsbyId: async (req, res) =>{
        const { id }= req.params;
        let text;
        try{
            text = await prisma.text.findUnique({
                where:{id},
                include:{
                    word:{
                        select:{
                            word: true
                        }
                    },
                    author: true,
                    translator: true,
                    texts: {
                        select:{
                            translations: true
                        }
                    }
                }
            });
            if(!text){
                res.status(404).json({ error: ('Не найден текст по id')});
            }
            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов по автору' });
        }
    },
    
    createText: async (req, res) =>{
        let name, year, biography, image, authorId, photoUrl, avatarName, author;
        let wordRU, wordEng, meaningsRU, meaningsEN, letter, wordId, word;

        try{
            if(!("authorId" in req.body)){
                name = req.body.name;
                year = req.body.year;
                biography = req.body.biography;
                const files = req.files;
                if(files){
                    image = files.image
                }
                photoUrl = '/images/authorPlaceHolder.png';
                author = await AuthorService.createAuthorFunc(image, avatarName, name, photoUrl, year, biography);
                authorId = author.authorId;
            }
            else{
                authorId = req.body.authorId;
            }

            if(!("wordId" in req.body)){
                wordRU = req.body.wordRU.trim();
                wordEng = req.body.wordEng.trim();
                meaningsRU = req.body.meaningsRU;
                meaningsEN = req.body.meaningsEN;
                letter = wordRU[0].toLowerCase();
                word = await WordService.createWord(letter, wordRU, wordEng, meaningsRU, meaningsEN);
                wordId = word.wordId;
            }
            else
            {
                wordId = req.body.wordId;
            }

            
            
            


            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов по автору' });
        }
    }

};

module.exports = TextController;


