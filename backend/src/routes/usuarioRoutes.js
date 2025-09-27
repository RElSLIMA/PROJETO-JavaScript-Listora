const express = require('express');
const usuarioRoutes = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/usuarioController');

// Registrar novo usuário
usuarioRoutes.post('/registrar', registrarUsuario);

// Login de usuário
usuarioRoutes.post('/login', loginUsuario);

module.exports = usuarioRoutes;
