const Sequelize = require('sequelize');
// URL fornecida pelo ElephantSQL
const urlDataBase = 'postgres://bfstavjj:Spxe96xqCbaga1hojp5t3aMlXB1Kr-a_@kesavan.db.elephantsql.com/bfstavjj';

// Configuração da conexão com o banco de dados
const sequelize = new Sequelize(urlDataBase, {
      dialect: 'postgres',
      dialectOptions: {},
});

// Testando a conexão
sequelize.authenticate()
      .then(() => {
            console.log('Conexão com o banco de dados estabelecida com sucesso.');
      })
      .catch(err => {
            console.error('Erro ao conectar-se ao banco de dados:' + err);
      });

