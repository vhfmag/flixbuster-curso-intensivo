const CUPOM_METADE_DESCONTO = "HTMLNAOELINGUAGEM";

fetch("https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?language=pt-BR")
    .then(res => res.json())
    .then(respostaJson => {
        const filmes = respostaJson.results;

        const listagemGeralFilmes = document.querySelector(".listagem.geral .filmes");
        popularListagemFilmes(filmes, listagemGeralFilmes);

        const listagemTopFilmes = document.querySelector(".listagem.top .filmes");
        popularListagemFilmes(filmes.slice(0, 5), listagemTopFilmes);
    });

function popularListagemFilmes(filmes, elemento) {
    elemento.innerHTML = "";
    for (const filme of filmes) {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${filme.poster_path}">
            <div class="overlay">
                <img src="imagens/estrela-vazada.png">
                <div class="metadados">
                    <h3>${filme.title}</h3>
                    <div class="avaliacao">
                        <img src="imagens/estrela-preenchida.svg">
                        ${filme.vote_average}
                    </div>
                </div>
                <button>
                    <span>Sacola</span>
                    <span class="preco">
                        R$ <span class="valor">${filme.price}</span>
                    </span>
                </button>
            </div>
        `;

        elemento.append(li);

        const elementoBotao = li.querySelector("button");
        elementoBotao.addEventListener("click", () => {
            const valorPersistido = localStorage.getItem("sacola");

            let sacola = [];
            if (valorPersistido) {
                sacola = JSON.parse(valorPersistido);
            }

            const filmeNaSacola = sacola.filter(itemDeSacola => itemDeSacola.filme.id === filme.id)[0];
            if (filmeNaSacola) {
                filmeNaSacola.qtd++;
            } else {
                sacola.push({ qtd: 1, filme: filme });
            }

            localStorage.setItem("sacola", JSON.stringify(sacola));
            popularSacola();
        });
    }
}

function popularSacola() {
    const valorPersistido = localStorage.getItem("sacola");
    const cupom = localStorage.getItem("cupom");

    let sacola = [];
    if (valorPersistido) {
        sacola = JSON.parse(valorPersistido);
    }

    const elementoItensSacola = document.querySelector(".itens-sacola");
    const elementoSacolaVazia = document.querySelector(".sacola-vazia");
    const elementoBotaoComprar = document.querySelector(".sacola .comprar");
    if (sacola.length === 0) {
        // sacola vazia
        elementoItensSacola.setAttribute("hidden", "");
        elementoBotaoComprar.setAttribute("hidden", "");
        elementoSacolaVazia.removeAttribute("hidden");
    } else {
        elementoItensSacola.removeAttribute("hidden");
        elementoBotaoComprar.removeAttribute("hidden");
        elementoSacolaVazia.setAttribute("hidden", "");

        elementoItensSacola.innerHTML = "";
        for (const item of sacola) {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${item.filme.poster_path}">
                <div class="metadados">
                    <div class="titulo">${item.filme.title}</div>
                    <div class="preco">
                        R$ ${item.filme.price}
                    </div>
                </div>
                <div class="acoes">
                    <button class="adicionar">
                        <img src="imagens/adicionar.png" alt="Adicionar mais um filme à sacola">
                    </button>
                    <span>${item.qtd}</span>
                    <button class="remover">
                        ${
                            item.qtd === 1 ?
                                `<img src="imagens/deletar.png" alt="Remover filme da sacola">`
                                : `<img src="imagens/remover.png" alt="Remover um filme da sacola">`
                        }
                    </button>
                </div>
            `;

            elementoItensSacola.append(li);

            const botaoAdicionar = li.querySelector(".adicionar");
            const botaoRemover = li.querySelector(".remover");

            botaoAdicionar.addEventListener("click", () => {
                item.qtd++;
                localStorage.setItem("sacola", JSON.stringify(sacola));
                popularSacola();
            });

            botaoRemover.addEventListener("click", () => {
                if (item.qtd > 1) {
                    item.qtd--;
                } else {
                    sacola = sacola.filter(itemDeSacola => itemDeSacola.filme.id !== item.filme.id);
                }

                localStorage.setItem("sacola", JSON.stringify(sacola));
                popularSacola();
            });
        }

        const elementoPrecoTotal = document.querySelector(".comprar .preco");
        const precoTotal = sacola.reduce((soma, itemDeSacola) => {
            return soma + itemDeSacola.qtd * itemDeSacola.filme.price;
        }, 0);

        elementoPrecoTotal.innerText = cupom === CUPOM_METADE_DESCONTO ? precoTotal / 2 : precoTotal;
    }
}

popularSacola();

const inputCupom = document.querySelector(".input-cupom input");
inputCupom.addEventListener("input", () => {
    localStorage.setItem("cupom", inputCupom.value);
    popularSacola();
});
inputCupom.value = localStorage.getItem("cupom");

const botaoTodos = document.querySelector(".filtros button:first-child");
botaoTodos.addEventListener("click", () => {
    fetch("https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?language=pt-BR")
        .then(res => res.json())
        .then(respostaJson => {
            const filmes = respostaJson.results;

            const listagemGeralFilmes = document.querySelector(".listagem.geral .filmes");
            popularListagemFilmes(filmes, listagemGeralFilmes);

            const botoes = document.querySelectorAll(".filtros button");
            for (const botao of botoes) {
                botao.classList.remove("selecionado");
            }

            botaoTodos.classList.add("selecionado");
        });
})

fetch("https://tmdb-proxy-workers.vhfmag.workers.dev/3/genre/movie/list?language=pt-BR")
    .then(res => res.json())
    .then(respostaJson => {
        const generos = respostaJson.genres;

        const elementoFiltros = document.querySelector(".filtros");
        for (const genero of generos.slice(0, 4)) {
            const button = document.createElement("button");
            button.innerText = genero.name;

            elementoFiltros.append(button);

            button.addEventListener("click", () => {
                fetch(`https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?with_genres=${genero.id}&language=pt-BR`)
                    .then(res => res.json())
                    .then(respostaJson => {
                        const filmes = respostaJson.results;

                        const listagemGeralFilmes = document.querySelector(".listagem.geral .filmes");
                        popularListagemFilmes(filmes, listagemGeralFilmes);
                        console.log(filmes);
                    });

                const botoes = document.querySelectorAll(".filtros button");
                for (const botao of botoes) {
                    botao.classList.remove("selecionado");
                }

                button.classList.add("selecionado");
            });
        }
    });

let minutosFaltando = 5;
let segundosFaltando = 0;

const elementoContagemRegressiva = document.querySelector(".contagem-regressiva");
const idDoInterval = setInterval(() => {
    segundosFaltando--;

    if (segundosFaltando < 0) {
        minutosFaltando--;
        segundosFaltando = 59;
    }

    const minutos = minutosFaltando.toString().padStart(2, "0");
    const segundos = segundosFaltando.toString().padStart(2, "0");

    elementoContagemRegressiva.innerText = `00:${minutos}:${segundos}`;

    if (minutosFaltando === 0 && segundosFaltando === 0) {
        document.querySelector(".banner").remove();
        clearInterval(idDoInterval);
    }
}, 1000);

