const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const pubsub = new PubSub()
const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const query = {}
            if (args.author) {
                const author = await Author.findOne({ name: args.author })

                if (!author) {
                    return []
                }
                query.author = author._id
            }
            if (args.genre) {
                query.genres = { $exists: true, $in: [args.genre] }
            }
            return Book.find(query).populate('author')
        },
        allAuthors: async () => Author.find({}),
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
                        code: 'UNAUTHENTICATED',
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
                const newBook = await Book.findById(book._id).populate('author')
                pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
                return newBook
            } catch (error) {
                throw new GraphQLError(`Saving book failed, reason: ${error.message}`, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.title,
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
                        code: 'UNAUTHENTICATED',
                    },
                })
            }
            const author = await Author.findOne({ name: args.name })
            if (!author) {
                return null
            }
            author.born = args.setBornTo
            try {
                await author.save()
            } catch (error) {
                throw new GraphQLError(`Editing author failed: ${error.message}`, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        error,
                    },
                })
            }
            return author
        },
        createUser: async (root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            })
            return user.save().catch((error) => {
                throw new GraphQLError(`Creating the user failed, reason: ${error.message}`, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.username,
                        error,
                    },
                })
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
                if (!user || (args.password !== 'secret')) {
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
            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
        _resetDatabase: async () => {
            if (process.env.NODE_ENV !== 'test') {
                throw new GraphQLError('_resetDatabase can be used oly in test mode')
            }
            await Author.deleteMany({})
            await Book.deleteMany({})
            await User.deleteMany({})
            return true
        },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
        },
    },
}

module.exports = resolvers