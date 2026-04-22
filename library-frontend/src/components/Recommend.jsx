import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommended = ({ show }) => {
    const booksQuery = useQuery(ALL_BOOKS)
    const meQuery = useQuery(ME)
    if (!show) {
        return null
    }if (booksQuery.loading || meQuery.loading) {
        return <div>loading...</div>
    }
    if (booksQuery.error) {
        return <div>error: {booksQuery.error.message}</div>
    }
    if (meQuery.error) {
        return <div>error: {meQuery.error.message}</div>
    }

    const books = booksQuery.data.allBooks
    const user = meQuery.data.me
    const favoriteGenre = user.favoriteGenre
    const filteredBooks = books.filter(book => {
        return book.genres.includes(favoriteGenre)
    })
    return (
        <div>
            <h2>recommendations</h2>
            <p>
                books in your favorite genre <strong>{favoriteGenre}</strong>
            </p>
            <table>
                <tbody>
                <tr>
                    <th></th>
                    <th>author</th>
                    <th>published</th>
                </tr>
                {filteredBooks.map(book => (
                    <tr key={book.title}>
                        <td>{book.title}</td>
                        <td>{book.author.name}</td>
                        <td>{book.published}</td>
                    </tr>
                ))}
                </tbody></table>
        </div>
        )
}
export default Recommended