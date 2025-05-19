const botao = document.getElementById('button');
const texto = document.getElementById('texto');

let palavra  = '';

const recognition = new (webkitSpeechRecognition || SpeechRecognition)();

const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const grammarList = new SpeechGrammarList();
const letters = ['a', 'bê', 'cê', 'dê', 'é', 'efe', 'gê', 'agá', 'i', 'jota',
                 'cá', 'ele', 'eme', 'ene', 'ó', 'pê', 'quê', 'erre', 'esse', 
                 'tê', 'u', 'vê', 'dáblio', 'xis', 'ípsilon', 'zê', 'agudo',
                 'circunflexo', 'til']; // Incluindo os nomes das letras

const grammar = '#JSGF V1.0; grammar letters; public <letter> = ' + letters.join(' | ') + ' ;';
grammarList.addFromString(grammar, 1);
recognition.grammars = grammarList;

recognition.lang = 'pt-BR'; // Importante definir o idioma
recognition.interimResults = true;
//recognition.maxAlternatives = 1;
recognition.continuous = true;

recognition.onresult = function(event) {
  const result = event.results[0][0].transcript;
  palavra += result
  console.log('Letra reconhecida:', result);
  // Atualize a interface do seu jogo com a letra reconhecida
};

recognition.onspeechend = function() {
  recognition.stop();
  console.log('PALAVRA reconhecida:', palavra);
};

recognition.onerror = function(event) {
  console.error('Erro de reconhecimento:', event.error);
  // Trate o erro e forneça feedback ao jogador
};

// Função para iniciar o reconhecimento quando o jogador tentar soletrar
function iniciarReconhecimento() {
  recognition.start();
}

// Chame iniciarReconhecimento() quando o jogador precisar falar uma letra
