const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('ad_say', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        freezeTableName: false
    }
});


sequelize.authenticate().then(() => {
    console.log("connection to database established");
}).catch((err) => {
    console.error(err);
});



const User = sequelize.define('user', {
    //Model attributes are defined here
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },

    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    address: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 

    user_agent: {
        type: DataTypes.JSON,
        allowNull: false
    },

    membership: {
        type: DataTypes.JSON,
        allowNull: false,
    },

    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },

    acc_verification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }

}, {
    // Other model options go here
});



const Post = sequelize.define('post', {
    // Model attributes are defined here
    post_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    seller_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    description: {
        type: DataTypes.JSON,
        allowNull: false
    }

}, {
    // Other model options go here
});


const Image = sequelize.define('image', {
    // Model attributes are defined here
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },

    post_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    seller_id: {
        type: DataTypes.STRING,
        allowNull: false,
    }

}, {
    // Other model options go here
});



const Notifications = sequelize.define('notification', {
    // Model attributes are defined here
    buyer_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    seller_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    notification: {
        type: DataTypes.STRING,
        allowNull: true,
    }

}, {
    // Other model options go here
});


// User.sync({ force: true }).then(() => {
//     console.log("done");
// }).catch((err) => {
//     console.error(err);
// })


module.exports = {User, Post, Notifications, Image, sequelize}