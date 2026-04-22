require('dotenv').config()
const connectToDatabase = require('./models/connectDb')
const startServer = require('./server')
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI
const main = async () => {
    await connectToDatabase(MONGODB_URI)
    await startServer(PORT)
}
main()