import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
    const [genre, setGenre] = useState(null)

    const result = useQuery(ALL_BOOKS, {
        skip: !show,
    })
    if (!show) {
        return null}
    if (result.loading) {
        return <div>loading...</div>
    }
    const books = result.data.allBooks
    const filteredBooks = genre
        ? books.filter(book => book.genres.includes(genre))
        : books

    const allGenres = []
    books.forEach(book => {
        book.genres.forEach(genre => {
            if (!allGenres.includes(genre)) {
                allGenres.push(genre)
            }
        })
    })
    return (
        <div>
            <h2>books</h2>
            <p>
                in genre <strong>{genre ? genre : 'all genres'}</strong>
            </p>
            <table>
                <tbody>
                <tr>
                    <th>title</th>
                    <th>author</th>
                    <th>published</th>
                </tr>
                {filteredBooks.map(book => (
                    <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author.name}</td>
                        <td>{book.published}</td>
                    </tr>
                ))}
                </tbody>
            </table>
                <div>
                {allGenres.map(g => (
                    <button key={g} onClick={() => setGenre(g)}>
                        {g}
                    </button>
                ))}
                <button onClick={() => setGenre(null)}>all genres</button>
            </div>
        </div>
    )
}

export default Books