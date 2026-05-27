import { Carrinho } from '../../domain/Carrinho.js';
import { Item } from '../../domain/Item.js';
import { UserMother } from './UserMother.js';

export class CarrinhoBuilder {
    constructor() {
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [new Item('Produto Padrão', 100.00)];
    }

    comUser(user) {
        this.user = user;
        return this;
    }

    comItens(itens) {
        this.itens = itens;
        return this;
    }

    vazio() {
        this.itens = [];
        return this;
    }

    build() {
        return new Carrinho(this.user, this.itens);
    }
}
