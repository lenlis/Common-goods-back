const { prisma } = require("../prisma/prisma-client");



const AutorController = {

    getAutors: async (req, res) =>{
        let textId = req.query.textId;
        let autors;
        try{
            if(textId == undefined){
                autors = await prisma.author.findMany(
                    {include:{texts:true}}
                    );
            }
            else
            {
                autors = await prisma.author.findMany({
                    where:{ texts:{ id: textId} },
                    orderBy: {
                        name: 'asc'
                    },
                    include:{texts:true}
                });
            }
            if(!autors){
                res.status(404).json({ error: ('Не найдены авторы')});
            }
            res.json(autors);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов' });
        }
    },

    getAutorsById: async (req, res) =>{
        const { id } = req.params;

        try{
            
            const autor = await prisma.author.findUnique({
                where:{ id },
                include:{texts:true}
            });
            if(!autor){
                res.status(404).json({ error: ('Не найдены авторы по id')});
            }
            res.json(autor);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения авторов по id' });
        }
    },

};

module.exports = AutorController;