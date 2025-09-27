const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Registrar novo usuário
const registrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const usuario = await prisma.user.create({
      data: { nome, email, senha_hash: senhaHash }
    });
    res.json({ id: usuario.id, email: usuario.email });
  } catch (err) {
    res.status(400).json({ error: 'Email já cadastrado', detalhes: err.message });
  }
};

// Login de usuário
const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await prisma.user.findUnique({ where: { email } });

  if (!usuario) return res.status(400).json({ error: 'Usuário não encontrado' });

  const correspondencia = await bcrypt.compare(senha, usuario.senha_hash);
  if (!correspondencia) return res.status(401).json({ error: 'Senha incorreta' });

  const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
};

module.exports = { registrarUsuario, loginUsuario };
