const Sequelize = require('sequelize');
// URL fornecida pelo ElephantSQL
const urlDataBase = process.env.ELEPHANTSQL_URL_DATABASE;

// Configuração da conexão com o banco de dados
const sequelize = new Sequelize(urlDataBase, {
      dialect: 'postgres',
      dialectOptions: {},
});
module.exports = sequelize;
// Testando a conexão
// sequelize.authenticate()
//       .then(() => {
//             console.log('Conexão com o banco de dados estabelecida com sucesso.');
//       })
//       .catch(err => {
//             console.error('Erro ao conectar-se ao banco de dados:' + err);
//       });

