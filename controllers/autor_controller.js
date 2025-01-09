const { Result } = require("express-validator");
const { prisma } = require("../prisma/prisma-client");



const AutorController = {

    getAutors: async (req, res) =>{
        let textId = req.query.textId;
        let word = req.query.word;
        let autors;
        try{
            if(textId == undefined && word == undefined){
                autors = await prisma.author.findMany(
                    {include:{texts:true}}
                    );
            }
            else
            {
                if (word != undefined && textId != undefined){
                    autors = await prisma.author.findMany({
                        where:{
                            AND:[
                                {
                                    texts:{
                                        id: textId
                                    }

                                },
                                {
                                    name:
                                    {
                                        contains: word, 
                                        mode: 'insensitive'
                                    },
                                    
                                }
                            ],
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
                else if(word != undefined){
                    autors = await prisma.author.findMany({
                        where:{
                             name:{
                                contains: word, 
                                mode: 'insensitive'
                            },          
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
                else{
                    autors = await prisma.author.findMany({
                        where:{
                            texts:{
                                id: textId
                            }
                        },
                        orderBy: {
                            name: 'asc'
                        },
                        include:{texts:true}
                    });
                }
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
        let autor;
        try{
            console.log(id)
            autor = await prisma.author.findUnique({
                where:{id},
                include:{
                    texts: true
                }
            });
            console.log(id)
            if(!autor){
                res.status(404).json({ error: ('Не найдены авторы по id')});
            }
            res.json(autor);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    createAutor: async () =>{
        let {name, year, biography} = req.body;
        let { image } = req.files;
        let photoUrl = __dirname + '/../uploads/authorPlaceHolder.png';
        try{
        if(image != undefined){
            const avatarName = `${name}.png`;
            const avatarPath = path.join(__dirname, '/../uploads', avatarName);
            fs.writeFileSync(avatarPath, image);
        }
        const author = prisma.author.create({
            data: {
              name,
              photoUrl: `/uploads/${avatarName}`,
              year,
              biography, 
            },
          });
        res.json(author);
        } catch (error) {
            console.error("Error createauthor:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = AutorController;