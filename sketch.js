function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (x1 < x2 + w2 &&
          x1 + w1 > x2 &&
          y1 < y2 + h2 &&
          y1 + h1 > y2);
}

let estado = 'telaInicial';
let pontuacao = 0;
let fase = 1;
let vidas = 2;

let coletaSound, colisaoSound, trilhaSound;

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

let jogador;
let itens = [];
let obstaculos = [];
let framesParaNovoItem = 0;
let framesParaNovoObstaculo = 0;

function preload() {
  coletaSound = loadSound('sons/coleta.mp3');
  colisaoSound = loadSound('sons/colisao.mp3');
  trilhaSound = loadSound('sons/trilha.mp3');
}

function setup() {
  createCanvas(600, 400);
  jogador = new Trator();
  textAlign(CENTER, CENTER);
  fill(0);
  {
  let cnv = createCanvas(600, 400);
  cnv.parent('game-container');  // Faz o canvas ficar dentro da div com borda
}

}

function draw() {
  background(135, 206, 235);
  
  if (estado === 'telaInicial') {
    telaInicial();
  } else if (estado === 'jogando') {
    jogar();
  } else if (estado === 'fim') {
    telaFim();
  }
}

function telaInicial() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Festejando a conexão do campo à cidade\n", width / 2, height / 4);
  
  textSize(18);
  text("Regras:\n- Use as setas ← e → para mover o trator\n- Colete os alimentos do campo e cidade\n- Evite roupas que caem na estrada\n- Pontue coletando alimentos\n- Cuidado, você tem 2 vidas!\n\n\nPressione ENTER para iniciar", width / 2, height / 2);
}

function jogar() {
  if (!trilhaSound.isPlaying()) {
    trilhaSound.loop();
  }
  
  fill(100);
  rect(0, height - 100, width, 100);
  
  jogador.mover();
  jogador.mostrar();
  
  framesParaNovoItem--;
  if (framesParaNovoItem <= 0) {
    itens.push(new Item());
    framesParaNovoItem = max(30 - fase * 3, 10);
  }
  
  framesParaNovoObstaculo--;
  if (framesParaNovoObstaculo <= 0) {
    obstaculos.push(new Obstaculo());
    framesParaNovoObstaculo = max(60 - fase * 5, 20);
  }
  
  for (let i = itens.length - 1; i >= 0; i--) {
    itens[i].mover();
    itens[i].mostrar();
    
    if (jogador.colidiu(itens[i])) {
      pontuacao += 5;
      coletaSound.play();
      itens.splice(i, 1);
      atualizarFase();
    } else if (itens[i].y > height) {
      itens.splice(i, 1);
    }
  }
  
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
      obstaculos.splice(i, 1);
    }
  }
  
  fill(0);
  textSize(18);
  textAlign(LEFT, CENTER);
  text(`Pontuação: ${pontuacao}`, 20, 30);
  text(`Fase: ${fase}`, width / 2, 30);
  text(`Vidas: ${vidas}`, width - 120, 30);
}

function telaFim() {
  background(180, 50, 50);
  fill(255);
  noStroke();
  
  // Centraliza textos principais horizontal e verticalmente
  textAlign(CENTER, CENTER);
  
  textSize(36);
  text("Fim de Jogo!", width / 2, height / 3);
  
  textSize(24);
  text(`Sua pontuação: ${pontuacao}`, width / 2, height / 2);
  
  textSize(18);
  text("Pressione ENTER para jogar novamente", width / 2, height / 1.5);
 
}
function keyPressed() {
  if ((estado === 'telaInicial' || estado === 'fim') && keyCode === ENTER) {
    iniciarJogo();
  }
}

function iniciarJogo() {
  pontuacao = 0;
  fase = 1;
  vidas = 2;
  itens = [];
  obstaculos = [];
  jogador = new Trator();
  estado = 'jogando';
}

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
