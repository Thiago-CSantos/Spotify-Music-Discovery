const express = require('express');

const routes = express.Router();
//Usuario para teste
const users = [
      {
            id: 1,
            name: 'Thiago',
            email: 'thiago@dev.com',
            password: '123'
      },
      {
            id: 1,
            name: 'João',
            email: 'joão@dev.com',
            password: '123456'
      },
]

routes.post('/loginApp', (req, res) => {
      const { email, password } = req.body;

      const user = users.find((usuario) => { return usuario.email === email && usuario.password === password });

      if (user) {
            return res.status(200).json(user);
      }
      return res.status(400).send('Credenciais invalidas');


});

module.exports = routes;