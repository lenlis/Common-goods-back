const { prisma } = require("../prisma/prisma-client");



const AutorController = {
    getAllAutors: async (req, res) =>{
        try{
            
            const autors = await prisma.autor.findMany();

            res.json(autors);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов' });
        }
    },
    getAutorsByWord: async (req, res) =>{
        const { wordId } = req.params;

        try{
            
            const autors = await prisma.autor.findMany({
                where:{ wordId },
            });
            if(!autors){
                res.status(404).json({ error: ('Не найдены авторы по слову')});
            }
            res.json(autors[0]);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов по слову' });
        }
    },

};

module.exports = AutorController;