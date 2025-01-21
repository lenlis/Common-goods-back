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
                        translators: {
                            select:{
                                author: true
                            }
                        },
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
                    where:{ AND:[
                        {
                            authorId: {equals: authorId},
                        },
                        {
                            word:{
                                some:{
                                    word:{
                                        id:{equals:wordId},
                                    }
                                }
                            }
                        },
                    ]},
                    include:{
                        word:{
                            select:{
                                wordId:true, 
                                word: true
                            }
                        },
                        author: true,
                        translators: {
                            select:{
                                author: true
                            }
                        },
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
                        translators: {
                            select:{
                                author: true
                            }
                        },
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
                    translators: {
                        select:{
                            author: true
                        }
                    },
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
                        language: parts[i][j].language, 
                        text: parts[i][j].text,
                        translatorId: parts[i][j].id
                    }});
                }
            }
            
            text = await prisma.text.findUnique({where: {id}});


            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка создания текста'  });
        }
    },

    updateText: async (req, res) =>{
        let i, j;
        let authorId, wordsId, id;
        let title, titleRU, description, rubric, pubYear, translators;
        let originalLang, pubPlace, publisher, catalogNum, storage, size, type;
        let parts;
        let part
        try{
        id = req.body.id;
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
            
            let text = await prisma.text.update({
                where: {id},
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

            text = await prisma.text.findUnique({where: {id}, include:{word: true, translators: true, texts:{select: {id: true, translations: true}}}});
            for (i = 0; i < text.word.length; i++){
                let connectionId = text.word[i].id;
                await prisma.connectionWordText.delete({where:{id: connectionId}})
            }
            for (i = 0; i < text.translators.length; i++){
                let connectionId = text.translators[i].id;
                await prisma.connectionAuthorText.delete({where:{id: connectionId}})
            }
            for (i = 0; i < text.texts.length; i++){
                for (j = 0; j < text.texts[i].translations.length; j++){
                    let translationId = text.texts[i].translations[j].id;
                    await prisma.translation.delete({where:{id : translationId}});
                }
                let partId = text.texts[i].id;
                part = await prisma.part.delete({where: {id : partId}});
            }
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
                        language: parts[i][j].language, 
                        text: parts[i][j].text,
                        translatorId: parts[i][j].id
                    }});
                }
            }
            
            text = await prisma.text.findUnique({where: {id}});


            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка создания текста'  });
        }
    },

    deleteText: async (req, res) =>{
        let i, j;
        let id;
        let part
        try{
        id = req.body.id;
        }
        catch(err){
            res.status(500).json({ error: 'Ошибка получения параметров' });
        }

        try{
            let text = await prisma.text.findUnique({where: {id}, include:{word: true, translators: true, texts:{select: {id: true, translations: true}}}});
            for (i = 0; i < text.word.length; i++){
                let connectionId = text.word[i].id;
                await prisma.connectionWordText.delete({where:{id: connectionId}})
            }
            for (i = 0; i < text.translators.length; i++){
                let connectionId = text.translators[i].id;
                await prisma.connectionAuthorText.delete({where:{id: connectionId}})
            }
            for (i = 0; i < text.texts.length; i++){
                for (j = 0; j < text.texts[i].translations.length; j++){
                    let translationId = text.texts[i].translations[j].id;
                    await prisma.translation.delete({where:{id : translationId}});
                }
                let partId = text.texts[i].id;
                part = await prisma.part.delete({where: {id : partId}});
            }

            text = await prisma.text.delete({where: {id}});

            res.json(text);
        } catch (err) {
            res.status(500).json({ error: 'Ошибка создания текста'  });
        }
    }

};

module.exports = TextController;


