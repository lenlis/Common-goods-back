const { prisma } = require("../prisma/prisma-client");



const WordController = {
    
    getAllWords: async (req, res) =>{
        try{
            
            const words = await prisma.word.findMany({
                orderBy: {
                    letter: 'desc'
                }
            });
            res.json(words);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    getWordsByLetter: async (req, res) =>{
        const { letter } = req.params;

        try{
            const words = await prisma.word.findMany({
                where: { letter },
            });

            if(!words){
                res.status(500).json({ error: 'Не найдено слово' });
            }

            res.json(words);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов по букве' });
        }
    },
};

module.exports = WordController;