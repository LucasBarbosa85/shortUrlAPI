const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ auth: false, message: 'Token não fornecido.' });
  }

  jwt.verify(token, 'seu_segredo', (err, decoded) => {
    if (err) {
      return res.status(500).json({ auth: false, message: 'Falha ao autenticar o token.' });
    }
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;