const express = require('express');
const fs = require('fs');
const config = require('./config.json')
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
var AssistantV1 = require('ibm-watson/assistant/v1');
var assistant = new AssistantV1({
    iam_apikey: '8cU_53JSR07spCo8ah_vxa4KgkF7cz1GNwZndNriynOg',
    url: 'https://gateway.watsonplatform.net/assistant/api/',
    version: '2018-09-19'
});

const languageTranslator = new LanguageTranslatorV3({
    iam_apikey: config[2].iam_apikey,
    url: config[2].url,
    version:  config[2].version,
});

const visualRecognition = new VisualRecognitionV3({
    url: config[0].url,
    version: config[0].version,
    iam_apikey: config[0].iam_apikey,
});

const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/index', function(req, res) {
    res.render('index.html');
});

app.get('/chat', function(req, res) {
    res.render('chat.html', {'resposta':''});
});

app.get('/chatbot', function(req, res) {

    var mensagem = req.query.mensagem;

    assistant.message( {
        input: { text: mensagem},
        assistant_id: '1b918bd1-6230-4185-b0f0-e04c4528ca6f',
        workspace_id: 'e73d4e08-0795-49f1-a25f-e626b2686baa',
    })
        .then(result => {
            var respostaBot = result.output.text[0];
            res.render('chat.html',{'resposta': respostaBot})
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/game', function(req, res) {
    var imgId = Math.floor(Math.random() * 7);
    var caminhoDaImagem = '/imagens/' + imgId + '.png';
    var params = {
        images_file: fs.createReadStream('./public' + caminhoDaImagem)
    };
    visualRecognition.classify(params).then(result => {
        var reconhecido = result.images[0].classifiers[0].classes[0].class;
        res.render('game.html', {'image': caminhoDaImagem, 'recognized': reconhecido, 'recognized2': reconhecido, 'resposta': 'Resposta', 'ajuda': 'Ajuda'});
    }).catch(err => {
        console.log(err);
    });
});


app.get('/pgame', function(req, res) {
    var imgId = req.query.imgId;
    var respostaJogador = req.query.resposta;
    var respostaJogo = req.query.reconhecido;
    var respostaFinal = 'Resposta';

    if(respostaJogador == respostaJogo) {
        respostaFinal = 'Acertou!';
    } else {
        respostaFinal = 'Errou!';
    }
    res.render('game.html', {'image': imgId, 'recognized': respostaJogo, 'recognized2': respostaJogo, 'resposta': respostaFinal, 'ajuda': 'Ajuda'});
});

app.get('/agame', function(req, res) {
    var imgId = req.query.imgId2;
    var reconhecido = req.query.reconhecido2;

    languageTranslator.translate({
        text: reconhecido,
        source: 'en',
        target: 'pt'
    }).then(translation => {
        res.render('game.html', {'image': imgId, 'recognized': reconhecido, 'recognized2': reconhecido, 'resposta': 'Resposta', 'ajuda': translation.translations[0].translation});
    }).catch(err => {
        console.log(err);
    });
});

app.listen(port, () => {
    console.log('App iniciada: http://localhost:' + port);
});