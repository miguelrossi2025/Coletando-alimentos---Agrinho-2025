// Função para verificar colisão entre dois retângulos
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (x1 < x2 + w2 &&
          x1 + w1 > x2 &&
          y1 < y2 + h2 &&
          y1 + h1 > y2);
}

// Variáveis de controle do jogo
let estado = 'telaInicial';
let pontuacao = 0;
let fase = 1;
let vidas = 2;

// Variáveis de som
let coletaSound, colisaoSound, trilhaSound;

// Classe do jogador (trator)
class Trator {
  constructor() {
    this.size = 50;
    this.x = width / 2 - this.size / 2;
    this.y = height - this.size - 20;
    this.speed = 7;
  }

  mostrar() {
    textSize(this.size);
    textAlign(LEFT, TOP);
    text('🚜', this.x, this.y);
  }

  mover() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;
    this.x = constrain(this.x, 0, width - this.size);
  }

  colidiu(obj) {
    return collideRectRect(this.x, this.y, this.size, this.size,
                           obj.x, obj.y, obj.size, obj.size);
  }
}

// Classe para os itens que devem ser coletados
class Item {
  constructor() {
    this.size = 40;
    this.x = random(0, width - this.size);
    this.y = -this.size;
    this.speed = 3 + fase * 0.5;
    this.emojis = ['🌽','🍎','🍞','🧀','🍅','🥕','🍇','🥚'];
    this.emoji = random(this.emojis);
  }

  mostrar() {
    textSize(this.size);
    textAlign(LEFT, TOP);
    text(this.emoji, this.x, this.y);
  }

  mover() {
    this.y += this.speed;
  }
}

// Classe para os obstáculos que devem ser evitados
class Obstaculo {
  constructor() {
    this.size = 45;
    this.x = random(0, width - this.size);
    this.y = -this.size;
    this.speed = 3 + fase * 0.5;
    this.emojis = ['👕','👖','🧥','👗','🧢','👟'];
    this.emoji = random(this.emojis);
  }

  mostrar() {
    textSize(this.size);
    textAlign(LEFT, TOP);
    text(this.emoji, this.x, this.y);
  }

  mover() {
    this.y += this.speed;
  }
}

// Variáveis do jogo
let jogador;
let itens = [];
let obstaculos = [];
let framesParaNovoItem = 0;
let framesParaNovoObstaculo = 0;

// Carrega os sons antes do início
function preload() {
  coletaSound = loadSound('sons/coleta.mp3');
  colisaoSound = loadSound('sons/colisao.mp3');
  trilhaSound = loadSound('sons/trilha.mp3');
}

// Inicializa o jogo
function setup() {
  let cnv = createCanvas(600, 400);
  cnv.parent('game-container'); // Coloca o canvas dentro da div HTML com borda
  jogador = new Trator();
  textAlign(CENTER, CENTER);
  fill(0);
}

// Função principal que desenha na tela a cada frame
function draw() {
  background(135, 206, 235); // Céu azul claro

  if (estado === 'telaInicial') {
    telaInicial();
  } else if (estado === 'jogando') {
    jogar();
  } else if (estado === 'fim') {
    telaFim();
  }
}

// Tela de início do jogo
function telaInicial() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Festejando a conexão do campo à cidade\n", width / 2, height / 4);

  textSize(18);
  text("Regras:\n- Use as setas ← e → para mover o trator\n- Colete os alimentos do campo e cidade\n- Evite roupas que caem na estrada\n- Pontue coletando alimentos\n- Cuidado, você tem 2 vidas!\n\nPressione ENTER para iniciar", width / 2, height / 2);
}

// Função principal que executa a lógica do jogo
function jogar() {
  // Inicia trilha sonora se não estiver tocando
  if (!trilhaSound.isPlaying()) {
    trilhaSound.loop();
  }

  // Desenha o chão
  fill(100);
  rect(0, height - 100, width, 100);

  // Atualiza e mostra o trator
  jogador.mover();
  jogador.mostrar();

  // Lógica de criação de novos itens
  framesParaNovoItem--;
  if (framesParaNovoItem <= 0) {
    itens.push(new Item());
    framesParaNovoItem = max(30 - fase * 3, 10);
  }

  // Lógica de criação de novos obstáculos
  framesParaNovoObstaculo--;
  if (framesParaNovoObstaculo <= 0) {
    obstaculos.push(new Obstaculo());
    framesParaNovoObstaculo = max(60 - fase * 5, 20);
  }

  // Verifica colisão com itens
  for (let i = itens.length - 1; i >= 0; i--) {
    itens[i].mover();
    itens[i].mostrar();

    if (jogador.colidiu(itens[i])) {
      pontuacao += 5;
      coletaSound.play();
      itens.splice(i, 1);
      atualizarFase();
    } else if (itens[i].y > height) {
      itens.splice(i, 1); // Remove item se sair da tela
    }
  }

  // Verifica colisão com obstáculos
  for (let i = obstaculos.length - 1; i >= 0; i--) {
    obstaculos[i].mover();
    obstaculos[i].mostrar();

    if (jogador.colidiu(obstaculos[i])) {
      colisaoSound.play();
      obstaculos.splice(i, 1);
      vidas--;
      if (vidas <= 0) {
        estado = 'fim';
        trilhaSound.stop();
      }
    } else if (obstaculos[i].y > height) {
      obstaculos.splice(i, 1); // Remove obstáculo se sair da tela
    }
  }

  // Exibe informações na tela (HUD)
  fill(0);
  textSize(18);
  textAlign(LEFT, CENTER);
  text(`Pontuação: ${pontuacao}`, 20, 30);
  text(`Fase: ${fase}`, width / 2, 30);
  text(`Vidas: ${vidas}`, width - 120, 30);
}

// Tela de fim de jogo
function telaFim() {
  background(180, 50, 50);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  textSize(36);
  text("Fim de Jogo!", width / 2, height / 3);

  textSize(24);
  text(`Sua pontuação: ${pontuacao}`, width / 2, height / 2);

  textSize(18);
  text("Pressione ENTER para jogar novamente", width / 2, height / 1.5);
}

// Detecta tecla pressionada
function keyPressed() {
  if ((estado === 'telaInicial' || estado === 'fim') && keyCode === ENTER) {
    iniciarJogo();
  }
}

// Inicia ou reinicia o jogo
function iniciarJogo() {
  pontuacao = 0;
  fase = 1;
  vidas = 2;
  itens = [];
  obstaculos = [];
  jogador = new Trator();
  estado = 'jogando';
}

// Atualiza a fase de acordo com a pontuação
function atualizarFase() {
  if (pontuacao >= 120) {
    fase = 4;
  } else if (pontuacao >= 70) {
    fase = 3;
  } else if (pontuacao >= 30) {
    fase = 2;
  } else {
    fase = 1;
  }
}
