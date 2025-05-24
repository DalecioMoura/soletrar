document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const gameArea = document.getElementById('game-area');
    const listenButton = document.getElementById('listen-button');
    const wordAudio = document.getElementById('word-audio');
    const startSpellButton = document.getElementById('start-spell-button');
    const timerDisplay = document.getElementById('timer');
    const sendButton = document.getElementById('send-button');
    const repeatButton = document.getElementById('repeat-button');
    const helpIcon = document.getElementById('help-icon');
    const definitionBox = document.getElementById('definition-box');
    const definitionText = document.getElementById('definition-text');
    const scoreValue = document.getElementById('score-value');
    const actionButtons = document.getElementById('id-action-buttons');
    const areaSoletracao = document.getElementById('area-soletracao');
    const divFeedback = document.getElementById('div-feedback');
    const spanFeedback = document.getElementById('span-feedback');

    let palavraSorteada = '';
    let definicao = '';
    let tempoRestante = 30;
    let intervaloDeTempo;
    let pontuacao = 0;
    let canSpell = false;

    let mediaRecorder = [];
    let recognition;
    let isRecording = false;
    let palavraSoletrada = '';

const mapaAcentos = {
                        'a agudo': 'á', 'e agudo': 'é', 'i agudo': 'í', 'o agudo': 'ó', 'u agudo': 'ú',
                        'a crase': 'à', 'a circunflexo': 'â', 'e circunflexo': 'ê', 'o circunflexo': 'ô',
                        'a til': 'ã', 'o til': 'õ', 'a tio': 'ã', 'o tio': 'õ', 'c cedilha': 'ç'
                        // ... adicione outras combinações
                    };

    function iniciarJogo() {
        pontuacao = 0;
        scoreValue.textContent = pontuacao;
        startButton.style.display = 'none';
        gameArea.style.display = 'block';
        sortearPalavra();
        //palavraAtual = reproduzirPalavraAleatoria();
    }

    async function sortearPalavra() {
        
        const dicionario = await fetch('bd/palavrasSemClassificacao.json');
        //const dicionario = await fetch('../bd/palavrasSemClassificacao.json');
        const palavras = await dicionario.json();

        const palavraAleatoria = Math.floor((Math.random()*3818)+1);
        palavraSorteada = palavras.dicionario[palavraAleatoria].palavra;
        definicao = palavras.dicionario[palavraAleatoria].significado;

        console.log(palavraSorteada);
        console.log(definicao);

        repeatButton.style.display = 'block';
        helpIcon.style.display = 'inline-block';
        divFeedback.style.display = 'none';
        spanFeedback.textContent = '';
        actionButtons.style.display = 'none';
        areaSoletracao.style.display = 'block';
        definitionBox.style.display = 'none';
        definitionText.textContent = '';
        startSpellButton.textContent = 'Iniciar Soletração';
        canSpell = false;
        tempoRestante = 30;
        timerDisplay.textContent = tempoRestante;
        clearInterval(intervaloDeTempo);
        reproduzirPalavra();
    }

    function reproduzirPalavra() {

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(palavraSorteada);

            utterance.lang = 'pt-BR'; // Opcional: definir a língua para português brasileiro
  
            utterance.rate = 0.7; // Opcional: definir a velocidade da fala (0.1 a 1.0)
 
            utterance.pitch = 1.5; // Opcional: definir o tom da voz (0 a 2)

            speechSynthesis.speak(utterance);
            return(palavraSorteada);
        } else {
            alert('A API de Text-to-Speech não é suportada neste navegador.');
        }
    }

    function iniciarTempo() {
        clearInterval(intervaloDeTempo);
        tempoRestante = 30;
        timerDisplay.textContent = tempoRestante;
        intervaloDeTempo = setInterval(() => {
            tempoRestante--;
            timerDisplay.textContent = tempoRestante;
            if (tempoRestante <= 0) {
                clearInterval(intervaloDeTempo);
                pararSoletracao();//endRound(false); // Tempo esgotado, resposta incorreta
            }
        }, 1000);
    }

    function iniciarSoletracao() {
        palavraSoletrada = '';
        canSpell = true;
        startSpellButton.textContent = 'Parar Soletração';

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
            // Permissão concedida!
            console.log('Permissão do microfone concedida.');
            alert('Permissão concedida!')
            // Você pode armazenar o stream se precisar mantê-lo ativo
            // const audioStream = stream;

            // Agora que temos permissão, podemos iniciar o reconhecimento de fala
                if (recognition) {
                    try{
                        recognition.stop();
                        recognition.start();
                    }
                    catch(error){
                        console.error('Erro ao iniciar o reconhecimento de fala:', error);
                    }    
                }
            })
            .catch(function(error) {
            // Permissão negada ou erro ao acessar o microfone
            console.error('Permissão do microfone negada ou erro:', error);
            // Exiba uma mensagem amigável ao usuário informando que o recurso precisa de acesso ao microfone
            alert('Para usar o reconhecimento de fala, você precisa permitir o acesso ao microfone.');
            // Você pode também fornecer instruções sobre como habilitar o microfone nas configurações do navegador
            });
    
        iniciarTempo();
    }

    function pararSoletracao() {
        canSpell = false;
        startSpellButton.textContent = 'Iniciar Soletração';
        clearInterval(intervaloDeTempo);
        stopRecording();
        acentuarVogalMelhorada(palavraSoletrada.toLocaleLowerCase());
        endRound(); // Para teste, vamos considerar como acerto ao parar
        actionButtons.style.display = 'block';
        areaSoletracao.style.display = 'none';
       
    }

    function endRound() {
        clearInterval(intervaloDeTempo);
        divFeedback.style.display = 'block';
        spanFeedback.style.textAlign = 'right'
        divFeedback.style.backgroundColor = 'lightgrey'
        repeatButton.style.display = 'none';
        helpIcon.style.display = 'none';
        definitionBox.style.display = 'none';
        console.log(`palavra sorteada: ${palavraSorteada}.\npalavrasoletrada: ${palavraSoletrada}.`);
        if (palavraSorteada == palavraSoletrada) {
            pontuacao++;
            scoreValue.textContent = pontuacao;
            spanFeedback.style.color = 'green';
            spanFeedback.innerHTML = `Parabens! Você acertou!<br>Palavra sorteada: ${palavraSorteada};<br>Palavra soletrada: ${palavraSoletrada}.`;
        } else {
            spanFeedback.style.color = 'red';
            spanFeedback.innerHTML = `Que pena! Você errou!<br>Palavra sorteada: ${palavraSorteada};<br>Palavra soletrada: ${palavraSoletrada}.`;
        }
    }

    listenButton.addEventListener('click', reproduzirPalavra);

    startSpellButton.addEventListener('click', () => {
        if (!canSpell) {
            iniciarSoletracao();
        } else {
            pararSoletracao();
        }
    });

    helpIcon.addEventListener('click', () => {
        definitionBox.style.display = 'block';
        definitionText.textContent = definicao;
    });

     function acentuarVogalMelhorada(palavra) {
        const arrayLetras = palavra.split(' ');
        let palavraAcentuada = '';
        for (let i = 0; i < arrayLetras.length; i++) {
            console.log('letra: '+arrayLetras[i])
            let letra = arrayLetras[i];
            const proximo = arrayLetras[i + 1];
            let combinacao = '';

            if(letra == 'hífen'){
                console.log('entrei no hífen')
                letra = '-';
            }   //caso seja reconhecida a letra acentuada, remove o acento
            if(letra == 'é'){
                letra = 'e';
            }   //caso seja reconhecida a letra acentuada, remove o acento
                
            if(letra == 'ó'){
                letra = 'o'; 
            }   //caso seja reconhecida a letra acentuada, remove o acento
            
            combinacao = `${letra} ${proximo}`.toLowerCase();

            if (mapaAcentos[combinacao]) {
                palavraAcentuada += mapaAcentos[combinacao];
                i++; // Pula o próximo elemento (o acento)
            } else {
                palavraAcentuada += letra;
            }
        }
        palavraSoletrada = palavraAcentuada;
    }

    startButton.addEventListener('click', iniciarJogo);
    sendButton.addEventListener('click', sortearPalavra);

    // Verificar se a Web Speech API é suportada
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('A API está sendo reconhecida')
        recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();

        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const grammarList = new SpeechGrammarList();
        const letters = ['a', 'bê', 'cê', 'dê', 'e', 'efe', 'gê', 'agá', 'i', 'jota',
                        'cá', 'ele', 'eme', 'ene', 'o', 'pê', 'quê', 'que', 'erre', 'esse', 
                        'tê', 'u', 'vê', 'dáblio', 'xis', 'ípsilon', 'zê', 'agudo',
                         'circunflexo', 'til', 'tio', 'tiu', 'crase', 'trema']; // Incluindo os nomes das letras

        const grammar = '#JSGF V1.0; grammar letters; public <letter> = ' + letters.join(' | ') + ' ;';
        grammarList.addFromString(grammar, 1);
        recognition.grammars = grammarList;

        recognition.lang = 'pt-BR';
        recognition.continuous = true; // Manter a escuta ativa
        
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('Gravando...');//transcriptionElement.textContent = 'Gravando...';
            isRecording = true;
        };

        recognition.onresult = (event) => {
             console.log('Resultados')
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                console.log('Iteração: '+i)
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + '';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                    console.log("Transição: "+ interimTranscript);
                }
                 
            }
            palavraSoletrada = (finalTranscript + interimTranscript);
            console.log("inter: "+interimTranscript+'\n'+'final: '+finalTranscript);
            
            //.replace(/\s/g, '');
            console.log("Palavra soletrada: "+ palavraSoletrada);
            console.log(finalTranscript + interimTranscript);//transcriptionElement.textContent = finalTranscript + interimTranscript;
        };

        recognition.onerror = (event) => {
            console.error('Erro de reconhecimento de fala:', event.error);
            console.log(`Erro de reconhecimento: ${event.error}`); //errorElement.textContent = `Erro de reconhecimento: ${event.error}`;
            stopRecording();
        };

        recognition.onend = () => {
            if (isRecording) {
                console.log('Parou de gravar');//transcriptionElement.textContent += ' (Parou de gravar)';
                stopRecording();
            }
        };
    } else {
        console.log('A Web Speech API não é suportada neste navegador.');//errorElement.textContent = 'A Web Speech API não é suportada neste navegador.';
    }

    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
            isRecording = false;
        }
    }

});