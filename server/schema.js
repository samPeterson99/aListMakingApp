const Item = require('./models/Item.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { uuid } = require('uuidv4')
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLNonNull, GraphQLList} = require('graphql')
const User = require('./models/User.js')

const UserType = new GraphQLObjectType({
    name: "User",
    fields:() => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
    })
})

const ItemType = new GraphQLObjectType({
    name: "Item",
    fields: () => (({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId)
            }
        }
    }))
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        items: {
            type: GraphQLList(ItemType),
            resolve(parent, args) {
                return Item.find()
            }
        },
        item: {
            type: ItemType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Item.findById(args.id)
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find()
            }
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID} },
            resolve(parent, args) {
                return User.findById(args.id)
            }
        },
        
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                username: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {

                const userExists = await User.findOne({email: args.email})

                if (userExists) {
                    throw new Error('User already exists with this email')
                }

                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(args.password, salt)
                const user = new User({
                    username: args.username,
                    email: args.email,
                    password: hashedPassword
                })

                return user.save()
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args) {
                Item.find({ userId: args.id }).then((items) => {
                    items.forEach(item => {
                        item.deleteOne()
                    })
                })
                return Item.findByIdAndRemove(args.id)
            }
        },
        signIn: {
            type: UserType,
            args: {
                email: { type: GraphQLNonNull(GraphQLString)},
                password: { type: GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args) {
                let user = await User.findOne({ email: args.email })

                if (!user) {
                    return {error: "User not found."}
                } else {
                    const valid = await bcrypt.compare(args.password, user.password)

                    if (!valid) {
                        return { error: "Password does not match."}
                    } else {
                        return {
                            // token: jwt.sign({ id: user.id }, process.env.JWT_SECRET),
                            user
                        }
                    }
                }
            }
        },
        addItem: {
            type: ItemType,
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                userId: { type: GraphQLNonNull(GraphQLID)},

            },
            resolve(parent, args) {
                const item = new Item({
                    title: args.title,
                    description: args.description,
                    userId: args.userId
                })

                return item.save()
            }
        },
        deleteItem: {
            type: ItemType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Item.findByIdAndRemove(args.id)
            }
        },
        updateItem: {
            type: ItemType,
            args: {
                title: { type: GraphQLString },
                id: { type: GraphQLNonNull(GraphQLID)},
                description: { type: GraphQLString },
            },
            resolve(parent, args) {
                return Item.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            title: args.title,
                            description: args.description,
                        }
                    },
                    { new: true }
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})