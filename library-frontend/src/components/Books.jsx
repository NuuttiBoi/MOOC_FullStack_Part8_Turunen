import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'
const Books = (props) => {
    const [selectedGenre, setSelectedGenre] = useState(null)
    const allBooksResult = useQuery(ALL_BOOKS, {
        variables: { genre: null },
        skip: !props.show,
    })
    const filteredBooksResult = useQuery(ALL_BOOKS, {
        variables: { genre: selectedGenre },
        skip: !props.show,
        fetchPolicy: 'network-only',
    })
    if (!props.show) {
        return null
    }
    if (allBooksResult.loading || filteredBooksResult.loading) {
        return <div>loading...</div>
    }
    const allBooks = allBooksResult.data.allBooks
    const booksToShow = filteredBooksResult.data.allBooks
    const genres = [...new Set(allBooks.flatMap((book) => book.genres))]
    return (
        <div>
            <h2>books</h2>
            <div>
                in genre <strong>{selectedGenre || 'all genres'}</strong>
            </div>
            <table>
                <tbody>
                <tr>
                    <th>title</th>
                    <th>author</th>
                    <th>published</th>
                </tr>
                {booksToShow.map((b) => (
                    <tr key={b.id}>
                        <td>{b.title}</td>
                        <td>{b.author.name}</td>
                        <td>{b.published}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div>
                {genres.map((genre) => (
                    <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                    >
                        {genre}
                    </button>
                ))}
                <button onClick={() => setSelectedGenre(null)}>all genres</button>
            </div>
        </div>
    )
}

export default Books