import { useState } from 'react'
import { useApolloClient, useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setPage }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)
    const client = useApolloClient()
    const [login] = useMutation(LOGIN, {
        onCompleted: async (data) => {
            const token = data.login.value
            setToken(token)
            localStorage.setItem('library-user-token', token)
            await client.resetStore()
            setPage('authors')
        },
        onError: () => {
            setErrorMessage('Login failed')
        },
    })
    if (!show) {
        return null
    }
    const submit = async (event) => {
        event.preventDefault()
        setErrorMessage(null)
        await login({
            variables: {
                username,
                password,
            },
        })
        setUsername('')
        setPassword('')
    }
    return (
        <div>
            <h2>login</h2>
            {errorMessage && <div>{errorMessage}</div>}
            <form onSubmit={submit}>
                <div>
                    <label>
                        username
                        <input
                            value={username}
                            onChange={({ target }) => setUsername(target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        password
                        <input
                            type="password"
                            value={password}
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </label>
                </div>
                <button type="submit">login</button>
            </form></div>
    )
}
export default LoginForm