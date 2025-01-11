var express = require('express');
const { WordController, AuthorController, TextController, UserController } = require('../controllers');
var router = express.Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware')
const adminMiddleware = require('../middlewares/admin-middleware')

router.get('/words/:id', WordController.getWordById);
router.get('/words/?', WordController.getWordsSearch); // lettter & word

router.get('/authors/?', AuthorController.getAuthors); //textId
router.get('/authors/:id', AuthorController.getAuthorsById)
router.post('/authors/', authMiddleware, adminMiddleware, AuthorController.createAuthor)
// router.post('/authors/', AutorController.createAutor)
router.put('/authors/', authMiddleware, adminMiddleware, AuthorController.updateAuthor)
router.delete('/authors/', authMiddleware, adminMiddleware, AuthorController.deleteAuthor)

router.get('/texts/?', TextController.getTextsSearch); // (wordId & authorId) || word(навание текста)
router.get('/texts/:id', TextController.getTextsbyId);

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    UserController.registration
);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);

router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
router.get('/users', authMiddleware, adminMiddleware, UserController.getUsers);

module.exports = router;
