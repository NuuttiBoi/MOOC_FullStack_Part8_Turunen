import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = ({ show, token }) => {
  const { loading, data, error } = useQuery(ALL_AUTHORS)
  const [born, setBorn] = useState('')
  const [name, setName] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (!show) return null
  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const authors = data?.allAuthors || []

  const submit = async (event) => {
    event.preventDefault()

    await editAuthor({
      variables: {
        name,
        setBornTo: Number(born),
      },
    })

    setBorn('')
    setName('')
  }

  return (
      <div>
        <h2>authors</h2>

        <table>
          <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>

          {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
          ))}
          </tbody>
        </table>

        {token && (
            <div>
              <h3>set birthyear</h3>

              <form onSubmit={submit}>
                <div>
                  <select
                      name="name"
                      value={name}
                      onChange={({ target }) => setName(target.value)}
                  >
                    <option value="" disabled>
                      select author
                    </option>

                    {authors.map((a) => (
                        <option key={a.name} value={a.name}>
                          {a.name}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>
                    born
                    <input
                        type="number"
                        value={born}
                        onChange={({ target }) => setBorn(target.value)}
                    />
                  </label>
                </div>

                <button type="submit">update author</button>
              </form>
            </div>
        )}
      </div>
  )
}

export default Authors