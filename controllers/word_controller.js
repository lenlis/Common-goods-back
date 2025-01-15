const { prisma } = require("../prisma/prisma-client");
const WordService = require('../service/word-service')



const WordController = {
    
    getWordById: async (req, res) =>{
        const { id }= req.params;
        try{
            
            const word = await prisma.word.findUnique({
                where:{id},

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

    createWord: async (req, res) =>{
        let wordRU, wordEng, meaningsRU, meaningsEN, letter;
        wordRU = req.body.wordRU.trim();
        wordEng = req.body.wordEng.trim();
        meaningsRU = req.body.meaningsRU;
        meaningsEN = req.body.meaningsEN;
        letter = wordRU[0].toLowerCase();
        try{
            let word = await WordService.createWord(letter, wordRU, wordEng, meaningsRU, meaningsEN);

            res.json(word);
        } catch (error) {
            console.error("Error create word:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    updateWord: async (req, res) =>{
        let id, wordRU, wordEng, meaningsRU, meaningsEN, letter;
        id = req.body.id;
        wordRU = req.body.wordRU.trim();
        wordEng = req.body.wordEng.trim();
        meaningsRU = req.body.meaningsRU;
        meaningsEN = req.body.meaningsEN;
        letter = wordRU[0].toLowerCase();
        try{
            
            const word = await prisma.word.update({
                where:{
                    id:id
                },
                data: {
                letter,
                wordRU,
                wordEng,
                meaningsRU,
                meaningsEN 
                },
            });

            res.json(word);
        } catch (error) {
            console.error("Error update word:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    deleteWord: async (req, res) =>{
        let id;
        id = req.body.id;
        try{
            const word = await prisma.word.delete({where:{id:id},});
            res.json(word);
        } catch (error) {
            console.error("Error delete word:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
};

module.exports = WordController;



