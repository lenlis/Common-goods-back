const { prisma } = require("../prisma/prisma-client");



const WordController = {
    
    getWordById: async (req, res) =>{
        const { id }= req.params;
        try{
            
            const word = await prisma.word.findUnique({
                where:{id},
                orderBy: {
                    letter: 'asc'
                }
            });
            res.json(word);
        } catch (err) {
            res.status(500).json({ error: "Ошибка поиска слова по id" });
        }
    },

    getWordsSearch: async (req, res) =>{
        let words;
        let letter = req.query.letter;
        let word = req.query.word;
        try{
            if(letter == undefined && word == undefined){
                words = await prisma.word.findMany({
                    orderBy: {
                        letter: 'asc'
                    }
                });
                res.json(words);
                return;
            }

        
            if((letter != undefined) && (word != undefined)){
                words = await prisma.word.findMany({
                    where: {
                        
                            OR:[
                                {
                                    wordRU:
                                    {
                                        contains: word, 
                                        mode: 'insensitive'
                                    },
                                },
                                {
                                    wordEng:
                                    {
                                        contains: word, 
                                        mode: 'insensitive'
                                    },
                                    
                                }
                            ],
                            AND:{
                                letter: 
                                {
                                    equals: letter,
                                    mode: 'insensitive'
                                },
                            },
                    },
                    orderBy: {
                        letter: 'asc'
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
                                equals: letter,
                                mode: 'insensitive'
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
                                        contains: word,
                                        mode: 'insensitive'
                                    },
                                },
                                {
                                    wordEng:
                                    {
                                        contains: word,
                                        mode: 'insensitive'
                                    }
                                }
                                    
                            ]
                        },
                        orderBy: {
                            letter: 'asc'
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