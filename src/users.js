const Sequelize = require('sequelize');
const database = require('./db');

const Users = database.define('users', {
      id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
      },
      name: {
            type: Sequelize.STRING,
            allowNull: false,
      },
      email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true, // Garante que o email seja único
      },
      password: {
            type: Sequelize.STRING,
            allowNull: false,
      }
});

module.exports = Users;