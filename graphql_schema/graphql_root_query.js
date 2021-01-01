const { User, Post, Notifications, Image } = require('./model/db');
const { ImageType, NotificationType, UserType, PostType } = require('./graphql_schema');
const {
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLSchema,
} = require('graphql');
const { post } = require('../controllers/account-route');
const Mutation = require('./graphql_root_mutation');

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,

            args: {
                id: { type: GraphQLID }
            },

            resolve: async (parent, args) => {
                try {
                    let result = await User.findAll({
                        where: {
                            id: args.id
                        }
                    });
                    return result[0].dataValues;
                } catch (err) {
                    console.error(err);
                }
            }
        },

        post: {
            type: PostType,

            args: {
                id: { type: GraphQLID },
                seller_id: { type: GraphQLID }
            },

            resolve: async (parent, args) => {
                try {
                    let result = await Post.findAll({
                        where: {
                            post_id: args.id || args.seller_id
                        }
                    });
                    return result[0].dataValues;
                } catch (err) {
                    console.error(err);
                }
            }
        },
    }
});



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});