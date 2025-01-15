const { prisma } = require("../prisma/prisma-client");

class WordService {
    static async createWord(letter, wordRU, wordEng, meaningsRU, meaningsEN){
        const tryWord = await prisma.word.findFirst({ where: { wordRU } });
        if (tryWord) {
            res.status(500).json({ error: "Такое слово уже существует" });
            return
        }
        const word = await prisma.word.create({
            data: {
                letter,
                wordRU,
                wordEng,
                meaningsRU,
                meaningsEN
            },
        });
        return(word);
    }
}

module.exports = WordService;