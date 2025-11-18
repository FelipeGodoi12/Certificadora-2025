const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET

function authAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Token não encontrado.' })
    
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' })
    if (!user.admin) return res.status(403).json({ message: 'Acesso negado para não administradores.' })
    req.user = user;
    next();
  });
}


module.exports = authAdmin;