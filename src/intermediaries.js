
const banco = require('./data/bancodedados');
//utilizando o query para validar senhar, na rota fica ?senha_banco=Cubos123Bank

function validarSenha (request, response, next) {
    
    const{senha_banco} =  request.query;
    //valida se senha foi informada
    if(!senha_banco){
        response.status(401).json({mensagem: 'Senha não informada!'});
       
    }
    //valida se senha está correta
    if(senha_banco !== "Cubos123Bank"){
        response.status(403).json({mensagem: 'A senha do banco informada é inválida!'});
    }

    next();
}

function validarSenhaBody (request, response, next){
    const {senha_usuario} = request.body;
    
    if(!senha_usuario){
        response.status(401).json({mensagem: 'Senha não informada!'});
       
    }
    //valida se senha está correta
    if(senha_usuario !== "123456"){
        response.status(403).json({mensagem: 'A senha do banco informada é inválida!'});
    }

    next();

}

function validarSenhaQuery (request, response, next){
    const {senha_usuario} = request.query;
    
    if(!senha_usuario){
        response.status(401).json({mensagem: 'Senha não informada!'});
       
    }
    //valida se senha está correta
    if(senha_usuario !== "123456"){
        response.status(403).json({mensagem: 'A senha do banco informada é inválida!'});
    }

    next();

}

function contaEncontradaBody(request,response, next){
    const {numero_conta} = request.body;
    //pega a conta
    const contaEncontrada = banco.contas.find(function (numeroConta) {
        return numeroConta.numero == numero_conta;
    }); 
    
    if(!contaEncontrada){
        return response.status(404).json({mensagem:'Conta não encontrada'});
    }
    if(isNaN(numero_conta)){
        response.status(400).json({mensagem: 'Número da conta inválido'});
    }

    //Armazena a conta encontrada no intermediário
    request.contaEncontrada = contaEncontrada;

    next();
}

function contaEncontradaQuery(request, response, next){
    const {numero_conta} = request.query;

    const contaEncontrada = banco.contas.find(function (numeroConta) {
        return numeroConta.numero == Number(numero_conta);
    });
    if(!contaEncontrada){
        return response.status(404).json({mensagem: 'Conta não existe!'});
    }
    if(isNaN(numero_conta)){
        response.status(400).json({mensagem: 'Número da conta inválido'});
    }

    request.contaEncontrada = contaEncontrada;
    next();
}

function contaEncontradaParams(request,response, next){
    const { numero_conta } = request.params;
    const contaEncontrada = banco.contas.find(function (numeroConta) {
        return numeroConta.numero == Number(numero_conta);
    });
     if(!contaEncontrada){
        response.status(404).json({mensagem:'conta não existe!'});
    }
    //valida se o número da conta digitado é realmente um número
    if(isNaN(numero_conta)){
        response.status(400).json({mensagem: 'Número da conta inválido'});
    }
    request.contaEncontrada = contaEncontrada;
    
    next();
}

function validarTodosOsCampos(request,response, next){
    const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
    //verifica se todos os campos foram informados
    if(!nome||!cpf||!data_nascimento||!telefone||!email||!senha){
        response.status(400).json({mensagem: 'Todos os campos são obrigatórios!'});
    }

    next();
}

module.exports = {
    validarSenha,
    validarSenhaBody,
    validarSenhaQuery,
    contaEncontradaBody,
    contaEncontradaQuery,
    contaEncontradaParams,
    validarTodosOsCampos
};