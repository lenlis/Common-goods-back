var express = require('express');
const { WordController, AutorController, TextController } = require('../controllers');
var router = express.Router();


router.get('/word/:id', WordController.getWordById);
router.get('/words/sirch', WordController.getWordsSirch);

router.get('/autors', AutorController.getAllAutors);
router.get('/autors/:wordId', AutorController.getAutorsByWord)

router.get('/texts', TextController.getAllTexts);
router.get('/texts/word/:wordId', TextController.getTextsByWord);
router.get('/texts/author/:authorId', TextController.getTextsByAutor);

module.exports = router;
