import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommended = ({ show }) => {
    const booksResult = useQuery(ALL_BOOKS)
    const curUserResult = useQuery(ME)
    if (!show) {
        return null
    }
    if (booksResult.loading || curUserResult.loading) {
        return <div>loading...</div>
    }
    if (booksResult.error) {
        return <div>Error: {booksResult.error.message}</div>
    }
    if (curUserResult.error) {
        return <div>Error: {curUserResult.error.message}</div>
    }
    const books = booksResult.data?.allBooks ?? []
    const favoriteGenre = curUserResult.data?.me?.favoriteGenre
    const recommendedBooks = books.filter((book) =>
        book.genres.includes(favoriteGenre)
    )
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
                {recommendedBooks.map((book) => (
                    <tr key={book.title}>
                        <td>{book.title}</td>
                        <td>{book.author.name}</td>
                        <td>{book.published}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default Recommended