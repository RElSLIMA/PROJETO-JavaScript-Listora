const express = require('express');
const itemRoutes = express.Router();
const { criarItem, listarItens, atualizarItem, deletarItem, registrarCompra } = require('../controllers/itemController');
const autenticarUsuario = require('../middlewares/autenticacaoMiddleware');

// Criar novo item
itemRoutes.post('/', autenticarUsuario, criarItem);

// Listar todos os itens do usuário
itemRoutes.get('/', autenticarUsuario, listarItens);

// Atualizar item
itemRoutes.put('/:id', autenticarUsuario, atualizarItem);

// Deletar item
itemRoutes.delete('/:id', autenticarUsuario, deletarItem);

// Registrar compra
itemRoutes.post('/:id/compra', autenticarUsuario, registrarCompra);

module.exports = itemRoutes;
