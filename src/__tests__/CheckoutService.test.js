import { CheckoutService } from '../services/CheckoutService.js';
import { Pedido } from '../domain/Pedido.js';
import { Item } from '../domain/Item.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';

describe('CheckoutService', () => {
    describe('quando o pagamento falha', () => {
        it('deve retornar null quando cobrar() retorna { success: false }', async () => {
            // Arrange
            const carrinho = new CarrinhoBuilder().build();
            
            // Stub do GatewayPagamento 
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: false })
            };
            
            // Dummies para as outras dependências
            const repositoryDummy = {};
            const emailServiceDummy = {};
            
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryDummy,
                emailServiceDummy
            );
            
            const cartaoCredito = { numero: '1234-5678-9012-3456' };
            
            const pedido = await checkoutService.processarPedido(carrinho, cartaoCredito);
            
            //Verificação de Estado
            expect(pedido).toBeNull();
            
            // Verificar que o stub foi chamado
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(100, cartaoCredito);
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('deve aplicar desconto de 10% e notificar via email', async () => {
            // Arrange
            const usuarioPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens([
                    new Item('Notebook', 150.00),
                    new Item('Mouse', 50.00)
                ])
                .build();
            
            const cartaoCredito = { numero: '9876-5432-1098-7654' };
            
            // Stub do GatewayPagamento
            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };
            
            // Stub do PedidoRepository
            const pedidoSalvo = new Pedido(123, carrinho, 180, 'PROCESSADO');
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };
            
            // Mock do EmailService
            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };
            
            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );
            
            const resultado = await checkoutService.processarPedido(carrinho, cartaoCredito);
            
            // Verifica se o desconto foi aplicado corretamente (R$ 200 * 0.90 = R$ 180)
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, cartaoCredito);
            
            // Verifica se o email foi enviado exatamente 1 vez
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            
            // Verifica os argumentos exatos do email
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'maria@example.com',
                'Seu Pedido foi Aprovado!',
                expect.stringContaining('Pedido 123')
            );
            
            // Verifica se o pedido foi retornado corretamente
            expect(resultado).toEqual(pedidoSalvo);
        });
    });
});
