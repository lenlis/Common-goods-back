const { prisma } = require("../prisma/prisma-client");



const WordController = {
    
    getWordById: async (req, res) =>{
        const { id }= req.params;
        try{
            
            const words = await prisma.word.findMany({
                where:{id},
                orderBy: {
                    letter: 'desc'
                }
            });
            res.json(words);
        } catch (err) {
            res.status(500).json({ error: "Ошибка поиска слова по id" });
        }
    },

    getWordsSirch: async (req, res) =>{
        let words;
        let letter = req.query.letter;
        let word = req.query.word;
        try{
            if(letter == undefined && word == undefined){
                words = await prisma.word.findMany({
                    orderBy: {
                        letter: 'desc'
                    }
                });
                res.json(words);
                return;
            }

        
            if(letter != undefined && word != undefined){
                words = await prisma.word.findMany({
                    where: {
                        AND:
                        [
                            {
                                letter: 
                                {
                                    equals: letter
                                }
                            },
                            {
                                OR:[
                                    {
                                        wordRU:
                                        {
                                            contains: word
                                        },
                                        wordEng:
                                        {
                                            contains: word
                                        }
                                    }
                                ]
                            },
                        ]
                    },
                    orderBy: {
                        letter: 'desc'
                    }
                    
                });
            }
            else{
                if(letter != undefined){
                    words = await prisma.word.findMany({
                        where: 
                        {
                            letter: 
                            {
                                equals: letter
                            }
                        },                        
                    });
                }
                else{
                    words = await prisma.word.findMany({
                        where: {
                            OR:
                            [
                                {
                                    wordRU:
                                    {
                                        contains: word
                                    },
                                },
                                {
                                    wordEng:
                                    {
                                        contains: word
                                    }
                                }
                                    
                            ]
                        },
                        orderBy: {
                            letter: 'desc'
                        }
                        
                    });
                }
                
            }

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