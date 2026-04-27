import { useEffect, useState } from 'react'
import {
    useApolloClient,
    useSubscription,
} from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/Login.jsx'
import Recommended from './components/Recommend.jsx'
import { BOOK_ADDED } from './queries.js'
import { addBookToCache } from './utils/apolloCache'

const App = () => {
    const [page, setPage] = useState('authors')
    const [token, setToken] = useState(null);
    const client = useApolloClient();
    useSubscription(BOOK_ADDED, {
        onData: ({ data }) => {
            const addedBook = data.data.bookAdded
            window.alert('A new book was added!!')
            addBookToCache(client.cache, addedBook)
        },
    })

    useEffect(() => {
        const savedToken = localStorage.getItem('library-user-token')
        if (savedToken) {
            setToken(savedToken)
        }
    }, [])

    const logout = () => {
        setToken(null)
        localStorage.clear()
        client.resetStore()
        setPage('authors')
    }
    return (
        <div>
            <div>
                <button onClick={() => setPage('authors')}>authors</button>
                <button onClick={() => setPage('books')}>books</button>
                {token ? (
                    <>
                        <button onClick={() => setPage('add')}>add book</button>
                        <button onClick={() => setPage('recommended')}>recommend</button>
                        <button onClick={logout}>logout</button>
                    </>
                ) : (
                    <button onClick={() => setPage('login')}>login</button>
                )}
            </div>
            <Authors show={page === 'authors'} token={token} />
            <Books show={page === 'books'} />
            <NewBook show={page === 'add' && token} />
            <Recommended show={page === 'recommended' && token} />
            <LoginForm
                show={page === 'login'}
                setToken={setToken}
                setPage={setPage}
            />
     </div>
    )
}
export default App