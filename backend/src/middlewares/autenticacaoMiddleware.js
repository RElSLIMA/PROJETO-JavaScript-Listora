const jwt = require('jsonwebtoken');

const autenticarUsuario = (req, res, next) => {
  // O token deve vir no cabeçalho Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    // Verifica o token usando a chave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.usuarioId; // adiciona o ID do usuário à requisição
    next(); // continua para a próxima função/rota
  } catch (err) {
    res.status(403).json({ error: 'Token expirado ou inválido' });
  }
};

module.exports = autenticarUsuario;
