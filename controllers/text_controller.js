const { prisma } = require("../prisma/prisma-client");



const TextController = {

    getTextsSearch: async (req, res) =>{
        let authorId = req.query.authorId;
        let wordId = req.query.wordId;
        let texts;

        try{
            if(authorId == undefined && wordId == undefined){
                texts = await prisma.text.findMany({
                    include:{
                        word:true,
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
            
            texts = await prisma.text.findMany({
                where:{ OR:[
                    {
                        authorId: {equals: authorId},
                    },
                    {
                        wordId:{equals: wordId},
                    },
                ]},
                include:{
                    word:true,
                    author: true,
                    translator: true,
                    texts: true,
                    texts: {
                        select:{
                            translations: true
                        }
                    }
                }
            });
            if(!texts){
                res.status(404).json({ error: ('Не найден текст по автору')});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов по автору' });
        }
    },

    getTextsbyId: async (req, res) =>{
        const { id }= req.params;
        let text;
        try{
            text = await prisma.text.findUnique({
                where:{id},
                include:{
                    word:true,
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
    

};

module.exports = TextController;