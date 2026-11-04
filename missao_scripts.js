const tela = document.getElementById("tela")
const cristaisFundoElemento = document.getElementById("cristaisFundo")

const obstaculoBase = document.getElementById("obstaculo")
const inimigoBase = document.getElementById("inimigo")
const meteorito = document.getElementById("meteorito")

const cristaisFundo = []
const obstaculos = []
const inimigos = []
const meteoritos = []

const QUANTIDADE_CRISTAIS = 6
const QUANTIDADE_METEOROS = 3
const QUANTIDADE_INIMIGOS = 3
const QUANTIDADE_METEORITOS = 3

const inimigoAtirador = document.getElementById("inimigoAtirador")
const jogador = document.getElementById("jogador")

const raio = document.getElementById("raio")
const raio2 = document.getElementById("raio2")
const tiroInimigo = document.getElementById("tiroInimigo")

const contador = document.getElementById("contador")
const tempoTexto = document.getElementById("tempo") 
const mensagem = document.getElementById("mensagem")
const tituloMensagem = document.getElementById("tituloMensagem")
const textoMensagem = document.getElementById("textoMensagem")
const botaoIniciar = document.getElementById("botaoIniciar")

let jogoAtivo = false
let pontos = 0
let tempo = 30
let navesAntingidas = 0
let intervaloJogo
let intervaloTempo
let municao = 3
let altenarDisparo

const teclas = new Set(),ALTURA_SEGURA = 45,VELOCIDADE_JOGADOR = 5.1
let tiroVX = -7,tiroVY = 0

botaoIniciar.addEventListener("click", iniciarJogo)

document.addEventListener("keydown", e=>{const k=e.key.toLowerCase()
     // Controles de movimento
     if([" ", "arrowup", "arrowdown", "w", "s"].includes(k))
          e.preventDefault()
          teclas.add(k)
     // Chama função disparar() ao apertar espaço
     if(e.key === " " && !e.repeat) 
          disparar()})

document.addEventListener("keyup", e=>teclas.delete(e.key.toLowerCase()))

function alturaAleatoria(el) {
     const max = Math.max(0, tela.clientHeight - ALTURA_SEGURA - el.offsetHeight)
     el.style.top = Math.floor(Math.random() * (max+1)) + "px"
}

function reposicionar(el,extra=0) {
     el.style.left = (tela.clientWidth+extra) + "px"
     alturaAleatoria(el)
}

function criarGrupo(base, classe, quantidade, lista) {
    if (lista.length > 0)
        return

    base.classList.add(classe)
    lista.push(base)

    for (let i = 1; i < quantidade; i++) {
        const copia = base.cloneNode(true)

        copia.removeAttribute("id")
        copia.classList.add(classe)

        tela.appendChild(copia)
        lista.push(copia)
    }
}

function criarCristais() {
    for (let i = 0; i < QUANTIDADE_CRISTAIS; i++) {
        const cristal = document.createElement("img");

        cristal.src = "imagens/cristal.png"
        cristal.classList.add("cristal-fundo")

        cristaisFundoElemento.appendChild(cristal)


        cristal.style.left = Math.random() * tela.clientWidth + "px"
        alturaAleatoria(cristal)

        cristaisFundo.push(cristal)
    }
}

function iniciarJogo() {
     clearInterval(intervaloJogo)
     clearInterval(intervaloTempo)

     municao = 3
     navesAntingidas = 0
     pontos = 0
     tempo = 30
     altenarDisparo = true

     contador.textContent = pontos
     tempoTexto.textContent=tempo

     document.getElementById('naveJogador').src = "imagens/naveJogador.png"

     jogador.style.top = Math.round((tela.clientHeight - jogador.offsetHeight) / 2) + "px"
     jogador.style.left = "35px"

     criarGrupo(inimigoBase, "inimigo", QUANTIDADE_INIMIGOS, inimigos)
     criarGrupo(obstaculoBase, "obstaculo", QUANTIDADE_METEOROS, obstaculos)
     criarGrupo(meteorito, "meteorito", QUANTIDADE_METEORITOS, meteoritos)

     inimigos.forEach((nave, indice) => {
          reposicionar(nave, 180 + indice * 250)
     })

     obstaculos.forEach((meteoro, indice) => {
          reposicionar(meteoro, 250 + indice * 280)
     })

     meteoritos.forEach((pequenoMeteoro, indice) => {
          reposicionar(pequenoMeteoro, 160 + indice * 200)
})

     reposicionar(inimigoAtirador, 300)

     raio.style.display = "none"
     raio2.style.display = "none"
     tiroInimigo.style.display = "none"

     teclas.clear()
     mensagem.classList.add("escondido")
     
     if (cristaisFundo.length === 0) {
          criarCristais()
     }

     jogoAtivo = true

     intervaloJogo = setInterval(atualizarJogo, 30)
     intervaloTempo = setInterval(atualizarTempo, 1000)
}

function atualizarJogo() {
     if(!jogoAtivo)return

     moverJogador()

     // movimenta nave inimiga
     inimigos.forEach(nave => {
          nave.style.left = nave.offsetLeft - 5 + "px"

          if(nave.offsetLeft < -nave.offsetWidth)
               reposicionar(nave, 180 + Math.random() * 220)
          // 180 ~ 400
     })

     // movimenta meteoros
     obstaculos.forEach(meteoro => {
          meteoro.style.left = meteoro.offsetLeft - 4 + "px"

          if(meteoro.offsetLeft < -meteoro.offsetWidth)
               reposicionar(meteoro, 250 + Math.random() * 250)
     })
     // movimenta meteoroitos
     meteoritos.forEach(pequenoMeteoro => {
          pequenoMeteoro.style.left = pequenoMeteoro.offsetLeft - 5 + "px"

          if(pequenoMeteoro.offsetLeft < -pequenoMeteoro.offsetWidth)
               reposicionar(pequenoMeteoro, 160 + Math.random() * 200)
     })

     // movimenta nave que atira
     if(municao > 0)
          inimigoAtirador.style.left = inimigoAtirador.offsetLeft - 1 + "px"
     else
          inimigoAtirador.style.left = inimigoAtirador.offsetLeft - 7 + "px"

     if(inimigoAtirador.offsetLeft < -inimigoAtirador.offsetWidth) {
          reposicionar(inimigoAtirador, 200 + Math.random() * 200)
          municao = 3
     }

     if(raio.style.display === "block") {
          raio.style.left = raio.offsetLeft + 12 + "px"

          if(raio.offsetLeft > tela.clientWidth)
               raio.style.display = "none"

          if(raio.style.display === "block") {
               for(const nave of inimigos) {
                    if(colidiu(raio, nave)) {
                         pontos += 20
                         tempo += 1
                         navesAntingidas++
                         contador.textContent = pontos

                         raio.style.display = "none"
                         reposicionar(nave, 180 + Math.random() * 220)
                    }
               }
          }
          if(raio.style.display === "block") {
               for(const pequenoMeteoro of meteoritos) {
                    if(colidiu(raio, pequenoMeteoro)) {
                         pontos += 10
                         contador.textContent = pontos

                         tempo += 1

                         reposicionar(pequenoMeteoro, 160 + Math.random() * 200)
                    }
               }
          }
          if(raio.style.display === "block") {
               for (const meteoro of obstaculos) {
                    if(colidiu(raio, meteoro)) {
                         raio.style.display = "none"

                         break
                    }
               }
          }

          if(raio.style.display === "block" && colidiu(raio, inimigoAtirador)) {
               pontos += 50
               tempo += 2
               navesAntingidas++
               municao = 3

               contador.textContent = pontos

               raio.style.display = "none"

               reposicionar(inimigoAtirador, 200 + Math.random() * 200)
          }
     }

     if(raio2.style.display === "block") {
          raio2.style.left = raio2.offsetLeft + 12 + "px"

          if(raio2.offsetLeft > tela.clientWidth)
               raio2.style.display = "none"

          if(raio2.style.display === "block") {
               for(const nave of inimigos) {
                    if(colidiu(raio2, nave)) {
                         pontos += 20
                         tempo += 1
                         navesAntingidas++
                         contador.textContent = pontos

                         raio2.style.display = "none"
                         reposicionar(nave, 180 + Math.random() * 220)
                    }
               }
          }

          if(raio2.style.display === "block") {
               for(const pequenoMeteoro of meteoritos) {
                    if(colidiu(raio2, pequenoMeteoro)) {
                         pontos += 10
                         contador.textContent = pontos

                         tempo += 1

                         reposicionar(pequenoMeteoro, 160 + Math.random() * 200)
                    }
               }
          }

          if(raio2.style.display === "block") {
               for (const meteoro of obstaculos) {
                    if(colidiu(raio2, meteoro)) {
                         raio2.style.display = "none"

                         break
                    }
               }
          }

          if(raio2.style.display === "block" && colidiu(raio2, inimigoAtirador)) {
               pontos += 50
               tempo += 3
               navesAntingidas++
               municao = 3

               contador.textContent = pontos

               raio2.style.display = "none"

               reposicionar(inimigoAtirador, 200 + Math.random() * 200)
          }
     }

     if(
          inimigoAtirador.offsetLeft < tela.clientWidth - 100 &&
          inimigoAtirador.offsetLeft > jogador.offsetLeft + 80 &&
          tiroInimigo.style.display !== "block" && Math.random() < 0.030)
       {
          if(municao > 0) {
               dispararInimigo()
          }
          
     }

     if(tiroInimigo.style.display === "block") {
          tiroInimigo.style.left = tiroInimigo.offsetLeft + tiroVX + "px";
          tiroInimigo.style.top = tiroInimigo.offsetTop + tiroVY + "px";

          if(colidiu(tiroInimigo, jogador)) {
               terminarJogo("Game Over", "Você foi acertado por um disparo inimigo.<br>Naves atingidas: " + navesAntingidas + "<br>Pontos: " + pontos)
               return
          }

          if(tiroInimigo.offsetLeft < -20 || tiroInimigo.offsetTop < -20 || tiroInimigo.offsetTop > tela.clientHeight)
               tiroInimigo.style.display = "none"
     }

     if (
          tiroInimigo.offsetLeft < -20 ||
          tiroInimigo.offsetTop < -20 ||
          tiroInimigo.offsetTop > tela.clientHeight
     ) {
          tiroInimigo.style.display = "none"
     }

     cristaisFundo.forEach(cristal => {
          cristal.style.left = cristal.offsetLeft - 1 + "px";

          if (cristal.offsetLeft < -cristal.offsetWidth) {
               cristal.style.left = tela.clientWidth + "px";
               alturaAleatoria(cristal);
          }
     })

     
     
     for(const meteoro of obstaculos) {
          if(colidiu(meteoro, jogador)) {
               terminarJogo("Game Over", "Um meteoro te acertou.<br>Naves atingidas: " + navesAntingidas + "<br>Pontos: " + pontos)
               return
          }
     }
     for(const pequenoMeteoro of meteoritos) {
          if(colidiu(pequenoMeteoro, jogador)) {
               terminarJogo("Game Over", "Um meteorito te acertou.<br>Naves atingidas: " + navesAntingidas + "<br>Pontos: " + pontos)
               return
          }
     }

     for(const nave of inimigos) {
          if(colidiu(nave, jogador)) {
               terminarJogo("Game Over", "Uma nave inimiga te atingiu.<br>Naves atingidas: " + navesAntingidas + "<br>Pontos: " + pontos)
               return
          }
     }


}

function moverJogador() {
     let y = jogador.offsetTop
     if(teclas.has("arrowup") || teclas.has("w"))
          y -= VELOCIDADE_JOGADOR
     if(teclas.has("arrowdown") || teclas.has("s"))
          y += VELOCIDADE_JOGADOR
     const max = tela.clientHeight - ALTURA_SEGURA - jogador.offsetHeight;
     jogador.style.top = Math.max(0, Math.min(max, y)) + "px"
}

function disparar() {
     if(!jogoAtivo || (raio.style.display === "block" && raio2.style.display === "block"))
          return;
     if(altenarDisparo){
          raio.style.left = (jogador.offsetLeft + jogador.offsetWidth - 2) + "px"
          raio.style.top = (jogador.offsetTop + jogador.offsetHeight / 2 - 2) + "px"
          raio.style.display = "block"
          altenarDisparo = false
     }
     else {
          raio2.style.left = (jogador.offsetLeft + jogador.offsetWidth - 2) + "px"
          raio2.style.top = (jogador.offsetTop + jogador.offsetHeight / 2 - 2) + "px"
          raio2.style.display = "block"
          altenarDisparo = true
     }
}

function dispararInimigo() {
     municao--
     const x = inimigoAtirador.offsetLeft, y = inimigoAtirador.offsetTop + inimigoAtirador.offsetHeight / 2;
     const alvoX = jogador.offsetLeft + jogador.offsetWidth / 2
     const alvoY = jogador.offsetTop + jogador.offsetHeight / 2
     const dx = alvoX - x, dy = alvoY - y, dist = Math.hypot(dx, dy) || 1
     tiroVX = dx / dist * 10
     tiroVY = dy / dist * 10
     tiroInimigo.style.left = (x - 10) +"px"
     tiroInimigo.style.top = (y - 4) + "px"
     tiroInimigo.style.display = "block"
}

function colidiu(a, b) {
     return a.offsetLeft < b.offsetLeft + b.offsetWidth && a.offsetLeft + a.offsetWidth > b.offsetLeft && a.offsetTop < b.offsetTop + b.offsetHeight && a.offsetTop + a.offsetHeight > b.offsetTop
}

function atualizarTempo() {
     if(!jogoAtivo)
          return
     tempo--
     tempoTexto.textContent = tempo
     if(tempo<=0)
          terminarJogo("Game Over!", "O tempo acabou.<br>Naves atingidas: " + navesAntingidas + "<br>Pontos: " + pontos)
}

function terminarJogo(titulo, texto) {
     if(!jogoAtivo)
          return
     document.getElementById('naveJogador').src = "imagens/naveExplodida.png"
     jogoAtivo = false
     clearInterval(intervaloJogo)
     clearInterval(intervaloTempo)
     raio.style.display = tiroInimigo.style.display="none"
     tituloMensagem.textContent = titulo
     textoMensagem.innerHTML = texto
     botaoIniciar.textContent="Jogar novamente"
     mensagem.classList.remove("escondido")
}
