const { prisma } = require("../prisma/prisma-client");



const AutorController = {

    getAutors: async (req, res) =>{
        let wordId = req.query.wordId;
        let autors;
        try{
            if(wordId == undefined){
                autors = await prisma.autor.findMany();
            }
            else
            {
                autors = await prisma.autor.findMany({
                    where:{ wordId },
                    orderBy: {
                        name: 'asc'
                    }
                });
            }
            if(!autors){
                res.status(404).json({ error: ('Не найдены авторы по слову')});
            }
            res.json(autors[0]);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов по слову' });
        }
    },

    getAutorsById: async (req, res) =>{
        const { id } = req.params;

        try{
            
            const autor = await prisma.autor.findUnique({
                where:{ id },
            });
            if(!autor){
                res.status(404).json({ error: ('Не найдены авторы по слову')});
            }
            res.json(autor);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов по слову' });
        }
    },

};

module.exports = AutorController;