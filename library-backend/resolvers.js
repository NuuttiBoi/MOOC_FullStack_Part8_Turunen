const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),

        allBooks: async (root, args) => {
            if (args.genre) {
                return Book.find({ genres: { $in: [args.genre] } }).populate('author')
            }

            return Book.find({}).populate('author')
        },

        allAuthors: async () => {
            return Author.find({})
        },

        me: (root, args, context) => {
            return context.currentUser
        },
    },

    Author: {
        bookCount: async (root) => {
            return Book.countDocuments({ author: root._id })
        },
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            try {
                let author = await Author.findOne({ name: args.author })

                if (!author) {
                    author = new Author({
                        name: args.author,
                        born: null,
                    })
                    await author.save()
                }

                const book = new Book({
                    title: args.title,
                    published: args.published,
                    author: author._id,
                    genres: args.genres,
                })

                await book.save()

                return Book.findById(book._id).populate('author')
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args,
                        error,
                    },
                })
            }
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            try {
                const author = await Author.findOne({ name: args.name })

                if (!author) {
                    return null
                }

                author.born = args.setBornTo
                await author.save()

                return author
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args,
                        error,
                    },
                })
            }
        },

        createUser: async (root, args) => {
            try {
                const user = new User({
                    username: args.username,
                    favoriteGenre: args.favoriteGenre,
                })

                return await user.save()
            } catch (error) {
                if (error.code === 11000) {
                    throw new GraphQLError('username must be unique', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.username,
                        },
                    })
                }

                throw new GraphQLError(error.message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args,
                        error,
                    },
                })
            }
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, JWT_SECRET) }
        },
    },
}

module.exports = resolvers