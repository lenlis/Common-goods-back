const { prisma } = require("../prisma/prisma-client");



const TextController = {

    getTextsSearch: async (req, res) =>{
        let authorId = req.query.authorId;
        let wordId = req.query.wordId;
        let textId = req.query.textId;
        let texts;

        try{
            if(authorId == undefined && wordId == undefined && textId == undefined){
                texts = await prisma.text.findMany({
                    include:{
                        word:true,
                        author: true
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
                    {
                        textId:{equals: textId},
                    }
                ]},
                include:{
                    word:true,
                    author: true,
                    textId:true
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
    

};

module.exports = TextController;