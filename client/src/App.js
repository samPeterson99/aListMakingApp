import Header from "./components/Header";
import Items from "./components/Items";
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({ 
  uri: 'http://localhost:6001/graphql',
  cache: new InMemoryCache()
})


function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Header />
        <Items />
      </ApolloProvider>
    </div>
  );
}

export default App;
