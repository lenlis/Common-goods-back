const { prisma } = require("../prisma/prisma-client");



const AutorController = {
    getAllAutors: async (req, res) =>{
        try{
            
            const autors = await prisma.autor.findMany();

            res.json(autors);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов' });
        }
    },
    getAutorsByWord: async (req, res) =>{
        const { wordId } = req.params;

        try{
            
            const autors = await prisma.autor.findMany({
                where:{ wordId },
            });
            if(!autors){
                res.status(404).json({ error: ('Не найден автор по слову ' +  wordId)});
            }
            res.json(autors);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения слов' });
        }
    },

};

module.exports = AutorController;