var express = require('express');
const { WordController, AutorController, TextController } = require('../controllers');
var router = express.Router();


router.get('/words/:id', WordController.getWordById);
router.get('/words/?', WordController.getWordsSearch); // lettter & word

router.get('/authors/?', AutorController.getAutors); //textId
router.get('/authors/:id', AutorController.getAutorsById)

router.get('/texts/?', TextController.getTextsSearch); // wordId & authorId
router.get('/texts/:id', TextController.getTextsSearch);

module.exports = router;
