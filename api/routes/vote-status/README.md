# Vote Status Resources

## Vote Status Structure

| KEY       | TYPE    | DESCRIPTION                           |
| --------- | ------- | ------------------------------------- |
| can_vote  | boolean | Se o usuário pode votar ou não        |
| rest_time | ?number | O tempo restante que falta para votar |

### Example Structure

```json
{
    "can_vote": false,
    "rest_time": 43196279
}
```

## Get user vote status

### GET `/api/vote-status/{user._id}`

Busque pelo status do voto de algum usuário, retorna um objeto de [vote status](#vote-status-structure)

-   O ID do bot é baseado se você estiver usando JWT ou api-key. Caso use JWT, o
    ID do bot será o `userId`, caso api-key, o ID do bot sera o `_id` do bot que
    a api-key pertence
