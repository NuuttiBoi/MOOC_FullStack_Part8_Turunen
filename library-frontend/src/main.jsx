import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    ApolloLink,
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const httpLink = new HttpLink({
    uri: 'http://localhost:4000',
})
const wsLink = new GraphQLWsLink(
    createClient({
        url: 'ws://localhost:4000',
        connectionParams: () => {
            const token = localStorage.getItem('library-user-token')
            return {
                authorization: token ? `Bearer ${token}` : '',
            }
        },
    }),
)
const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('library-user-token')
    operation.setContext({
        headers: {
            authorization: token ? `Bearer ${token}` : '',
        },
    })
    return forward(operation)
})
const splitLink = ApolloLink.split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    authLink.concat(httpLink),
)
const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </StrictMode>
)