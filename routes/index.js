var express = require('express');
const { WordController, AutorController, TextController } = require('../controllers');
var router = express.Router();


router.get('/words/:id', WordController.getWordById);
router.get('/words/?', WordController.getWordsSirch);

router.get('/authors', AutorController.getAllAutors);
router.get('/authors/:wordId', AutorController.getAutorsByWord)

router.get('/texts', TextController.getAllTexts);
router.get('/texts/word/:wordId', TextController.getTextsByWord);
router.get('/texts/author/:authorId', TextController.getTextsByAutor);

module.exports = router;
