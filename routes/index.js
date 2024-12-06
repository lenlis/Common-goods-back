var express = require('express');
const { WordController, AutorController, TextController } = require('../controllers');
var router = express.Router();


router.get('/words/:id', WordController.getWordById);
router.get('/words/?', WordController.getWordsSearch); // lettter & word

router.get('/authors', AutorController.getAllAutors);
router.get('/authors/:wordId', AutorController.getAutorsByWord)

router.get('/texts/?', TextController.getTextsSearch); // wordId & authorId

module.exports = router;
