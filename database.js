const Sequelize = require("sequelize");
const finale_rest = require("finale-rest");
const bcrypt = require("bcrypt");

const database = new Sequelize({
    dialect: "sqlite",
    storage: "/test.sqlite"
});

// tabla usuario en sqlite

const User = database.define("User", {
    
    identificacio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        
    },
    nombres: {
        type: Sequelize.STRING,
        allowNull: false
    },
    apellidos: {
        type: Sequelize.STRING,
        allowNull: false
    },
    usuario: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    // Con este metodo realizo un hash que encripta el password en la base de datos utilizando el paquete bcrypt
    hooks: {
        beforeCreate: (user, options) => {
             user.password = user.password && user.password != "" ? bcrypt.hash(user.password, 10): ""
        }
    }
});