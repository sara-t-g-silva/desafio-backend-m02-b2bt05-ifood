const banco = require('../data/bancodedados');

let numero = 1;
let saldo = 0;
let transferenciasPush = 0;

function listarContas(request, response) {
    response.status(200).json(banco);
}

function criarConta(request, response) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
    //verificar se cpf consta cadastrado com a função find
    const cpfEncontrado = banco.contas.find(function (usuarioCpf) {
        return usuarioCpf.usuario.cpf == cpf;
    });
    //verifica se o email consta como cadastrado
    const emailEncontrado = banco.contas.find(function (usuarioEmail) {
        return usuarioEmail.usuario.email == email;
    });
    //se estiver cadastrado email ou cpf, return de erro, conflit
    if (cpfEncontrado || emailEncontrado) {
        return response.status(409).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' })
    }
    //não entrando no if, cadastra novo usuário!
    const usuario = {
        numero: numero,
        saldo,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    numero++;
    banco.contas.push(usuario);
    //status code de create sem resposta no body!
    response.status(201).json();
}

function atualizarUsuario(request, response) {
    //recupera a conta encontrada do request armazenada no intermediário.
    const contaEncontrada = request.contaEncontrada;
    const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
    //Só verificar caso o cpf difgitado seja diferente do cadastrado anteriormente pelo cleinte
    if(cpf !== contaEncontrada.usuario.cpf){
            const cpfEncontrado = banco.contas.find(function (usuarioCpf) {
            return usuarioCpf.usuario.cpf == cpf;
        });
        if (cpfEncontrado) {
            return response.status(409).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' });
        }
    }
    if( email !== contaEncontrada.usuario.email){
        
        const emailEncontrado = banco.contas.find(function (usuarioEmail) {
            return usuarioEmail.usuario.email == email;
        });
        if(emailEncontrado){
            return response.status(409).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' })
        }
    }
    //caso o usuário tente alteração sem mudar cpf ou e-mail, as alterações são validadas sem verificação prévia no bd
    contaEncontrada.usuario.nome = nome;
    contaEncontrada.usuario.cpf = cpf;
    contaEncontrada.usuario.data_nascimento = data_nascimento;
    contaEncontrada.usuario.telefone = telefone;
    contaEncontrada.usuario.email = email;
    contaEncontrada.usuario.senha = senha;

    response.status(204).json();
}

function deletarUsuario(request, response){
    const {numero_conta} = request.params;
    //recupera a conta encontrada do request armazenada no intermediário.
    const contaEncontrada = request.contaEncontrada;

    if(contaEncontrada.saldo !== 0){
        return response.status(403).json({mensagem: 'Conta possui saldo ativo, não é possível excluir'});
    }
    
    banco.contas = banco.contas.filter(function (todasAsContas){
        return todasAsContas.numero != numero_conta;
    });

    return response.status(204).json();
}

function depositar(request, response){
    const {numero_conta, valor} = request.body;
    //recupera a conta encontrada do request armazenada no intermediário.
    const contaEncontrada = request.contaEncontrada;

    if(!numero_conta|| !valor){
        return response.status(400).json({mensagem: 'O número da conta e o valor são obrigatórios!'});
    }

    if(valor < 0 || valor == 0){
        return response.status(403).json({mensagem: 'Não pode ser realizado depositos de valores negativos em conta'});
    }
    //falta formatar data
    const registroDeposito = {
        data: new Date().toLocaleString(),
        numero_conta,
        valor
    }
  

    contaEncontrada.saldo += valor;

    banco.depositos.push(registroDeposito);

    response.status(204).json();
}
    


function sacar (request, response){
    const {numero_conta, valor, senha_usuario} = request.body;
    //recupera a conta encontrada do request armazenada no intermediário.
    const contaEncontrada = request.contaEncontrada;

    //verficar se campos foram preenchidos
    if(!numero_conta ||  !valor || !senha_usuario){
        return response.status(400).json({mensagem: 'O número da conta e o valor são obrigatórios!'});
    }
    //verifica se tem saldo suficiente
    if(contaEncontrada.saldo<valor){
        return response.status(403).json({mensagem:'saldo da conta insuficiente!'});
    }
    const registroSaque = {
        data: new Date().toLocaleString(),
        numero_conta,
        valor
    }
    
    contaEncontrada.saldo -= valor;

    banco.saques.push(registroSaque);

    response.status(204).json();
}

//essa função tem a obrigação de realizar o histórico de depósitos na conta de destino, após transfrência
function registrarDepositoContaDestino(contaDestino, valor){
    const registroDeposito = {
        data: new Date().toLocaleString(),
        numero_conta: contaDestino,
        valor
    }
  
    contaDestino.saldo += valor;

    banco.transferencias[transferenciasPush].transferenciasRecebidas.push(registroDeposito);

}

function transferir(request, response){
const {numero_conta_origem ,numero_conta_destino, valor, senha_usuario} = request.body;
    //encontrar a conta de origem
    const contaOrigemEncontrada = banco.contas.find(function (numeroConta) {
        return numeroConta.numero == numero_conta_origem;
    });
    //encontra a conta de destino da transação
    const contaDestinoEncontrada = banco.contas.find(function (numeroConta) {
        return numeroConta.numero == numero_conta_destino;
    });
    //verificação para todos os campos preenchidos
    if(!numero_conta_origem || !numero_conta_destino || !valor || !senha_usuario){
        return response.status(400).json({mensagem: 'Todos os campos são obrigatórios para esta transação!'});
    }

    if(!contaOrigemEncontrada){
        return response.status(404).json({mensagem: 'Conta de origem não existe!'});
    }

    if(!contaDestinoEncontrada){
        return response.status(404).json({mensagem: 'Conta de destino não existe!'});
    }

    if(contaOrigemEncontrada.saldo<valor){
        return response.status(403).json({mensagem:'saldo da conta insuficiente!'});
    }

    const registroTransferencias = {
        data: new Date().toLocaleString(),
        numero_conta_origem,
        numero_conta_destino,
        valor

    }

    //ao transferir não cria um depósito na conta destino. Verificar bug
    contaOrigemEncontrada.saldo -= valor;
    contaDestinoEncontrada.saldo += valor;
    //chamando a função para realizar registro
    registrarDepositoContaDestino(contaDestinoEncontrada.numero,valor);
    banco.transferencias.push(registroTransferencias);
    
    response.status(204).json();
}
//o parâmetro está sendo chamado pelo intermediário const  {numero_conta} = reques.query;
function mostrarSaldo (request,response){
    //parametros passados em query devem ser chamados por request.query, não é necessário passar senha_usuário pois a validação está sendo feita no intermediario
    //recupera a conta encontrada do request armazenada no intermediário.
    const contaEncontrada = request.contaEncontrada;
    response.status(200).json({saldo: contaEncontrada.saldo});
}

function mostrarExtrato (request, response){
    const {numero_conta} = request.query;
    const depositosConta = banco.depositos.filter(function(numeroConta){
        return numeroConta.numero_conta == numero_conta;
    });
    const saquesConta = banco.saques.filter(function(numeroConta){
        return numeroConta.numero_conta == numero_conta;
    });
    const transferenciasContaOrigem = banco.transferencias.filter(function(numeroConta){
        return numeroConta.numero_conta_origem == numero_conta;
    });
    const transferenciasContaDestino = banco.transferencias.filter(function(numeroConta){
        return numeroConta.numero_conta_destino == numero_conta;
    });
    let transferencias = [{transferenciasEnviadas: transferenciasContaOrigem},{tranferenciasRecebidas: transferenciasContaDestino}]
    let extratoTotal = [{depositos: depositosConta},{saques: saquesConta},{transferencias}]
    response.status(200).json(extratoTotal);
}
module.exports = {
    listarContas,
    criarConta,
    atualizarUsuario,
    deletarUsuario,
    depositar,
    sacar,
    transferir,
    mostrarSaldo,
    mostrarExtrato
}