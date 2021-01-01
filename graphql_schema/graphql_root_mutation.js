const { User, Post, Notifications, Image, sequelize } = require('./model/db');
const { ImageType, NotificationType, UserType, PostType } = require('./graphql_schema');
const {
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLSchema,
} = require('graphql');
const { post } = require('../controllers/account-route');

const Mutation = new GraphQLObjectType({
    name: 'mutation',

    fields: {
        addPost: {
            type: PostType,
            args: {
                description: { type: GraphQLString },
                price: { type: GraphQLInt },
                seller_id: { type: GraphQLString },
                post_id: { type: GraphQLID },
                quantity: { type: GraphQLInt },
            },

            async resolve(parent, args) {
                let query = 'INSERT INTO posts(post_id, description, price, seller_id, quantity) '
                query += `VALUES('${args.post_id}', '${args.description}', '${args.price}', '${args.seller_id}', '${args.quantity}')`
                try {
                    await sequelize.query(query);
                    console.log("stored in db");

                    let result = await Post.findAll({
                        where: {
                            post_id: args.post_id
                        }
                    });
                    return result[0].dataValues;
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
});

module.exports = Mutation;