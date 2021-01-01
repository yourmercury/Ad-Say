const graphql = require('graphql');
const GraphQLJSON = require('graphql-type-json');
const {User, Notifications, Post, Image} = require('./model/db');

const {
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLObjectType,
    GraphQLList
} = graphql;


const UserType = new GraphQLObjectType({
    name: 'user',

    fields: () => ({
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        phone: { type: GraphQLString },
        membership_status: { type: GraphQLString },
        user_agent: { type: GraphQLString },
        address: { type: GraphQLString },
        id: { type: GraphQLID }
    })
});

const NotificationType = new GraphQLObjectType({
    name: 'notification',

    fields: () => ({
        notification: { type: GraphQLString },
        buyer_id: { type: GraphQLString },
        seller_id: { type: GraphQLString }
    })
});


const ImageType = new GraphQLObjectType({
    name: 'image',

    fields: () => ({
        image: { type: GraphQLString },
        seller_id: { type: GraphQLString },
        post_id: { type: GraphQLString }
    })
});


const PostType = new GraphQLObjectType({
    name: "post",

    fields: () => ({
        price: { type: GraphQLInt },
        seller_id: { type: GraphQLString },
        post_id: { type: GraphQLID },
        description: { type: GraphQLString },
        quantity: { type: GraphQLInt },
        createdAt: { type: GraphQLString },
        updatedAt: {type: GraphQLString},
        

        images: {
            type: GraphQLList(ImageType),
            async resolve(parent, args) {
                try {
                    let result = await Image.findAll({
                        where: {
                            post_id: parent.post_id
                        }
                    });

                    let result_list = []

                    result.forEach(res => {
                        result_list.push(res.dataValues)
                    })

                    return result_list;
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }),
});

// (async function(){try {
//     let result = await Image.findAll({
//         where: {
//             post_id: 1
//         }
//     });

//     //console.log(result)
//     let pot = []
//     result.forEach(res => {
//         pot.push(res.dataValues)
//     })

//     console.log(pot)
// } catch (err) {
//     console.log(err)
// }})()


module.exports = { ImageType, NotificationType, UserType, PostType };