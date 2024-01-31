const express = require('express');
const routes = express.Router();
const database = require('./db');
const Users = require('./users');

// Conectando com banco de dados
database.sync();

// const novoUsuarios = Users.create({
//       name: 'Thiago',
//       email: 'thiago@dev.com',
//       password: '123'
// },);

// console.log(novoUsuarios);

routes.post('/loginApp', async (req, res) => {
      const { email, password } = req.body;

      try {
            const user = await Users.findOne({
                  where: {
                        email: email,
                        password: password,
                  }
            })
            const respostaJSON = {
                  user,
                  exist: true
            }
            if (user) {
                  return res.status(200).json(respostaJSON);
            } else {
                  return res.status(401).send('Credenciais invalidas');
            }

      } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro interno do servidor');
      }


});

routes.post('/cadastrarApp', async (req, res) => {
      const { name, email, password } = req.body;

      try {

            const existeUsuario = await Users.findOne({
                  where: {
                        email: email,
                  }
            });
            console.log('existeUsuario: ', existeUsuario);
            if (existeUsuario) {
                  return res.status(416).send('O email já está em uso.');
            }

            const novoUsuario = await Users.create({
                  name: name,
                  email: email,
                  password: password,
            });
            return res.status(201).json(novoUsuario);
      } catch (error) {
            console.error('Erro ao cadastrar novo usuário:', error);
            return res.status(500).send('Erro interno do servidor');
      }
});

module.exports = routes;