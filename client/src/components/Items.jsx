import { gql, useQuery } from '@apollo/client'
import ItemRow from './ItemRow'

const GET_ITEMS = gql`
    query getItems {
        items {
            id
            title
            description
            userId {
              id
              email
            }
          }
    }
`

export default function Items() {
    const { loading, error, data } = useQuery(GET_ITEMS)

    console.log(error)
    
    if (loading) return <p>Loading ...</p>
    if (error) return <p>Something went wrong ... </p>

    return <div>
        { !loading && !error && (
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>User</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map(item => (
                        <ItemRow key={item.id} item={item} />
                    ))}
                </tbody>
            </table>
        )
        }
    </div>
}