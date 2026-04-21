import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const result = useQuery(ALL_BOOKS, {
    skip: !props.show,
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks

  const genres = [...new Set(books.flatMap((book) => book.genres))]

  const booksToShow = selectedGenre
      ? books.filter((book) => book.genres.includes(selectedGenre))
      : books

  return (
      <div>
        <h2>books</h2>

        {selectedGenre && <div>in genre <strong>{selectedGenre}</strong></div>}

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