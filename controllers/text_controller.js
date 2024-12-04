const { prisma } = require("../prisma/prisma-client");



const TextController = {
    getAllTexts: async (req, res) =>{
        try{
            
            const texts = await prisma.text.findMany();

            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов' });
        }
    },
    getTextsByAutor: async (req, res) =>{
        const { autorId } = req.params;

        try{
            
            const texts = await prisma.text.findMany({
                where:{autorId},
            });
            if(!texts){
                res.status(404).json({ error: ('Не найден текст по автору ' +  autorId)});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов' });
        }
    },
    getTextsByWord: async (req, res) =>{
        const { wordId } = req.params;

        try{
            
            const texts = await prisma.text.findMany({
                where:{ wordId },
            });
            if(!texts){
                res.status(404).json({ error: ('Не найден текст по слову ' +  wordId)});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов' });
        }
    },

};

module.exports = TextController;