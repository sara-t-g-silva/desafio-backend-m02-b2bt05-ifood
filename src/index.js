const express = require('express');
const app = express();
//desestruturação do intermediário para evitar escrita de código longa
const {validarSenha, validarSenhaBody, validarSenhaQuery,contaEncontradaBody, contaEncontradaQuery, contaEncontradaParams,validarTodosOsCampos} = require('./intermediaries');
const bancoController = require('./Controller/bancoContoller');
app.use(express.json());
//listar todas as contas com validação de senha em query params
app.get('/contas', validarSenha, bancoController.listarContas);
//cria uma conta no banco
app.post('/contas', validarTodosOsCampos , bancoController.criarConta);
//atualizar usuario da conta
app.put('/contas/:numero_conta/usuario',contaEncontradaParams, validarTodosOsCampos, bancoController.atualizarUsuario);
//deletar uma conta
app.delete('/contas/:numero_conta', contaEncontradaParams , bancoController.deletarUsuario);
//depositar em um conta pré-existente
app.post('/transacoes/depositar', contaEncontradaBody, bancoController.depositar);
//saca de uma conta, necessário possuir saldo
app.post('/transacoes/sacar', validarSenhaBody,contaEncontradaBody, bancoController.sacar);
//transferência entre contas
app.post('/transacoes/transferir',validarSenhaBody,bancoController.transferir);
//mostrar saldo da conta em tela
app.get('/contas/saldo',validarSenhaQuery,contaEncontradaQuery,bancoController.mostrarSaldo);
//mostrar todo o extrato bancário
app.get('/contas/extrato', validarSenhaQuery, contaEncontradaQuery,bancoController.mostrarExtrato);
app.listen(3000);