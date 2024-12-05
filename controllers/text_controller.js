const { prisma } = require("../prisma/prisma-client");



const TextController = {
    getAllTexts: async (req, res) =>{
        try{
            
            const texts = await prisma.text.findMany({
                include:{
                    word:true,
                    author: true
                }
            });

            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов' });
        }
    },
    getTextsByAutor: async (req, res) =>{
        const { authorId } = req.params;

        try{
            
            const texts = await prisma.text.findMany({
                where:{ authorId: {equals: authorId}},
                include:{
                    word:true,
                    author: true
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
    getTextsByWord: async (req, res) =>{
        const { wordId } = req.params;

        try{
            
            const texts = await prisma.text.findMany({
                where:{wordId:{ equals: wordId}},
                include:{
                    word:true,
                    author: true
                }
            });
            if(!texts){
                res.status(404).json({ error: ('Не найден текст по слову')});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов по слову' });
        }
    },

};

module.exports = TextController;