const { prisma } = require("../prisma/prisma-client");



const TextController = {

    getTextsSearch: async (req, res) =>{
        let authorId = req.query.authorId;
        let wordId = req.query.wordId;
        let word = req.query.word;
        let texts;

        try{
            if(authorId == undefined && wordId == undefined && word == undefined){
                texts = await prisma.text.findMany({
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
                res.json(texts);
                return;

            }
            if((authorId != undefined || wordId != undefined) && word == undefined){
                texts = await prisma.text.findMany({
                    where:{ OR:[
                        {
                            authorId: {equals: authorId},
                        },
                        {
                            word:{
                                some:{
                                    wordId:{equals:wordId},
                                }
                            }
                        },
                    ]},
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
            }
            else{
                texts = await prisma.text.findMany({
                    where:{ OR:[
                        {
                            title:{
                                contains: word, 
                                mode: 'insensitive'
                            }
                        },
                        {
                            titleRU:{
                                contains: word, 
                                mode: 'insensitive'
                            }
                        }
                        ],
                    },
                    include:{
                        word:{
                            select:{
                                word: true
                            }
                        },
                        author: true,
                        translator: true,
                        texts: {
                            select:{
                                translations: true
                            }
                        }
                    }
                });
            }

            if(!texts){
                res.status(404).json({ error: ('Не найден текст по автору')});
            }
            res.json(texts);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    getTextsbyId: async (req, res) =>{
        const { id }= req.params;
        let text;
        try{
            text = await prisma.text.findUnique({
                where:{id},
                include:{
                    word:{
                        select:{
                            word: true
                        }
                    },
                    author: true,
                    translator: true,
                    texts: {
                        select:{
                            translations: true
                        }
                    }
                }
            });
            if(!text){
                res.status(404).json({ error: ('Не найден текст по id')});
            }
            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка получения текстов по автору' });
        }
    },
    
    createText: async (req, res) =>{
        let i, j;
        let authorId, wordsId;
        let title, titleRU, description, rubric, pubYear, translators;
        let originalLang, pubPlace, publisher, catalogNum, storage, size, type;
        let parts;
        let part
        /*
        parts = [[[En,text,id], [ru,text,id]], [[En,text,id], [ru,text,id]]];
        */
        try{
        wordsId = req.body.wordsId;
        authorId = req.body.authorId;
        title = req.body.title; 
        titleRU = req.body.titleRU; 
        description = req.body.description; 
        rubric = req.body.rubric; 
        pubYear = req.body.pubYear; 
        translators = req.body.translators; 
        originalLang = req.body.originalLang; 
        pubPlace = req.body.pubPlace; 
        publisher = req.body.publisher; 
        catalogNum = req.body.catalogNum; 
        storage = req.body.storage; 
        size = req.body.size; 
        type = req.body.type;
        parts = req.body.parts;
        }
        catch(err){
            res.status(500).json({ error: 'Ошибка получения параметров' });
        }

        try{
            
            let text = await prisma.text.create({
                data:{
                    authorId,
                    title, 
                    titleRU, 
                    description, 
                    rubric, 
                    pubYear, 
                    originalLang, 
                    pubPlace, 
                    publisher, 
                    catalogNum, 
                    storage, 
                    size, 
                    type
                }
            });
            let id = text.id
            for (i = 0; i < wordsId.length; i++){
                await prisma.connectionWordText.create({data:{textId: id, wordId: wordsId[i]}})
            }
            for (i = 0; i < translators.length; i++){
                await prisma.connectionAuthorText.create({data:{textId: id, authorId: translators[i]}})
            }

            for (i = 0; i < parts.length; i++){
                part = await prisma.part.create({data:{parentTextId:id}});
                for (j = 0; j < parts[i].length; j++){
                    await prisma.translation.create({data:{
                        parentPartId: part.id, 
                        language: parts[i][j][0], 
                        text: parts[i][j][1],
                        translatorId: parts[i][j][2]
                    }});
                }
            }
            
            text = await prisma.text.findUnique({where: {id}});


            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка создания текста'  });
        }
    }

};

module.exports = TextController;


