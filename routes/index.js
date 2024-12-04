var express = require('express');
const { WordController, AutorController, TextController } = require('../controllers');
var router = express.Router();


router.get('/words', WordController.getAllWords);
router.get('/words/:letter', WordController.getWordsByLetter);

router.get('/autors', AutorController.getAllAutors);
router.get('/autors/:wordId', AutorController.getAutorsByWord)

router.get('/texts', TextController.getAllTexts);
router.get('/texts/:wordId', TextController.getTextsByWord);
router.get('/texts/:autorId', TextController.getTextsByAutor);

module.exports = router;
