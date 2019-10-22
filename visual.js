var param = require("./config-visual.json");

var VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
var fs = require('fs');
// torna a funçao processar imagem publica ,para assim torala acessivel por outros modulos
// passar o parametro do caminho da imagem
module.exports.processarImagem = function (paramImg, palavraJogador ,res){

    var visualRecognition = new VisualRecognitionV3(param);
    var params = {
        images_file: fs.createReadStream(paramImg) // imagem localizada no diretório como o nome imagem.png
    };
    visualRecognition.classify(params)
        .then(result => {
            console.log(JSON.stringify(result, null, 2));

            var reconhecido = result.images[0].classifiers[0].classes[0].class;
            if (reconhecido == palavraJogador){
                res.send("Correto!!!!")


            }else{
                res.send("Errado!!!!")

            }
        })
        .catch(err => {
            console.log(err);
        });
}

