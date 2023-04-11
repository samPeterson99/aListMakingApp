

export default function ItemRow({ item }) {



    return( 
    <tr>
        <td>{ item.title }</td>
        <td>{ item.description }</td>
        <td>{ item.userId.email }</td>
    </tr>
    )
}