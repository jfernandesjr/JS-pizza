let cart = [];
let modalQt = 1;                                                            //Var para manter a qtd de pizzas no modal em 1
let modalKey = 0;                                                           //usada para saber qual a pizza fora do modal

const c = (el)=>document.querySelector(el);                                 //Facilita o querySelector substituindo tudo por c
const cs = (el)=>document.querySelectorAll(el);                             //Facilita o querySelectorAll substituindo tudo por cs

pizzaJson.map((item, index)=>{                                              //mapeia o Json para pegar as pizzas que estão em pizza.js
    let pizzaItem = c('.models .pizza-item').cloneNode(true);               //usa o modelo que tá no html, clonando-o

    pizzaItem.setAttribute('data-key', index);                              //criando um atributo que recebe o index de cada pizza
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;                                //mudando cada item de cada clone
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price.toFixed(2)}`;       //toFixed pra colocar 2 casas decimais
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
    pizzaItem.querySelector('a').addEventListener('click', (e)=>{            //adicionando um evento de clique para iniciar o modal
            e.preventDefault();                                              //isso aqui impede uma ação pré-configurada. No caso, a ideia
                                                                             //é impedir a tag "a" de atualizar a página automaticamente
            let key = e.target.closest('.pizza-item').getAttribute('data-key');  //usando o atributo criado lá em cima como chave
            modalQt = 1;                                                     //Reseta a quantidade sempre que abre o modal
            modalKey = key;                                                  //conseguir saber qual a pizza fora do modal
            
            c('.pizzaBig img').src = pizzaJson[key].img;                     //agora é possível saber qual é cada pizza através do key
            c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
            c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
            c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`;
            c('.pizzaInfo--size.selected').classList.remove('selected');     //reseta a seleção de tamanho das pizzas no modal
            cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
                if(sizeIndex == 2) {
                    size.classList.add('selected');                          //seta a seleção de tamanho no modal para grande
                }
                size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
            });

            c('.pizzaInfo--qt').innerHTML = modalQt;                          //seta a quantidade de pizzas para 1 no modal
                                                                             
            c('.pizzaWindowArea').style.opacity = 0;                         //muda a opacidade no css.
            c('.pizzaWindowArea').style.display = 'flex';                    //o display no css está none, tem que mudar pro modal aparecer
            setTimeout(()=>{                                                 //setTimeout para dar tempo de fazer uma transição suave
                c('.pizzaWindowArea').style.opacity = 1;                     //com opacidade em 100%, o modal aparece na tela
            }, 200);
            
    });
        

    c('.pizza-area').append( pizzaItem );                                   //acrescenta cada pizza em pizza-area
});

//Eventos do MODAL
function closeModal() {                                                                 //usada em vários locais, essa função serve para fechar o modal
    c('.pizzaWindowArea').style.opacity = 0;
    setTimeout(()=>{
        c('.pizzaWindowArea').style.display = 'none';
    }, 500);
}
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item)=>{        //usa a closeModal nos botões destinados a isso
    item.addEventListener('click', closeModal);
})
c('.pizzaInfo--qtmenos').addEventListener('click', ()=>{                                //botão diminuir do modal, impede ficar abaixo de 1
    if(modalQt > 1) {
        modalQt--;
        c('.pizzaInfo--qt').innerHTML = modalQt;
    }
});
c('.pizzaInfo--qtmais').addEventListener('click', ()=>{                                 //botão aumentar do modal
    modalQt++;
    c('.pizzaInfo--qt').innerHTML = modalQt;
});
cs('.pizzaInfo--size').forEach((size, sizeIndex)=>{                                     //seleção de tamanho. primeiro zera e depois seleciona a do usuário
    size.addEventListener('click', (e)=>{
        c('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
    })
});
c('.pizzaInfo--addButton').addEventListener('click', ()=>{                              //adiciona a pizza selecionada no carrinho
    let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));

    let identifier = pizzaJson[modalKey].id+'@'+size;

    let key = cart.findIndex((item)=>item.identifier == identifier);

    if(key > -1) {
        cart[key].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id:pizzaJson[modalKey].id,
            size,
            qt:modalQt
        });
    }

    
    updateCart();
    closeModal();
});

c('.menu-openner').addEventListener('click', ()=>{
    if(cart.length > 0) {
        c('aside').style.left = '0';
    }
});
c('.menu-closer').addEventListener('click', ()=>{
        c('aside').style.left = '100vw';
});


function updateCart() {
    c('.menu-openner span').innerHTML = cart.length;

    if(cart.length > 0) {
        c('aside').classList.add('show');
        c('.cart').innerHTML = '';

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        for(let i in cart) {         
            let pizzaItem = pizzaJson.find((item)=>item.id == cart[i].id);
            subtotal += pizzaItem.price * cart[i].qt;

            let cartItem = c('.models .cart--item').cloneNode(true);

            let pizzaSizeName;
            switch(cart[i].size) {
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2:
                    pizzaSizeName = 'G';
                    break;
            }
            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{
                if(cart[i].qt > 1) {
                    cart[i].qt--;
                } else {
                    cart.splice(i,1);
                }
                updateCart();
            });
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
                cart[i].qt++;
                updateCart();
            });


            c('.cart').append(cartItem);

        }

        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        c('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
        c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
        c('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;

    } else {
        c('aside').classList.remove('show');
        c('aside').style.left = '100vw';

    }
}