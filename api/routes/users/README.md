# User Resources

## Get user

### GET `/api/users/{user._id}`

Busque por um usuário na database, retorna uma estrutura de usuário

-   `notifications` será `null` se o ID do usuário for diferente do ID do autor da
    requisição

### Example Response

```json
{
    "team": {
        "members": []
    },
    "_id": "963124227911860264",
    "username": "meunreal",
    "avatar": "1f42e6dc5631724994ee7ea819371036",
    "notifications": {},
    "bio": "I updated my biography on 13/11/2024",
    "notifications_viewed": true
}
```

## Get author

### GET `/api/users/@me`

Busque pelo author da requisição, retorna uma estrutura de usuário completa

## Get user notifications

### GET `/api/users/notifications`

Retorne todas as notificações do usuário que corresponde ao JWT ou api-key

#### Example Response Structure

```json
{
    "1": {
        "content": "Something goes here",
        "type": 0,
        "sent_at": 1697124907633
    },
    "2": {
        "content": "Other words here",
        "type": 0,
        "sent_at": 1697125062370
    }
}
```

## Delete a notification

### DELETE `/api/users/notifications/{notificationId}`

Delete uma notificação do usuário que corresponde ao JWT ou api-key, retorna um
booleano se a notificação foi deletada

## Bulk delete all notifications

### DELETE `/api/users/notifications/bulk-delete`

Delete todas as notificações do usuário que corresponde ao JWT ou api-key

#### JSON Return

| FIELD | TYPE     | DESCRIPTION                              |
| ----- | -------- | ---------------------------------------- |
| count | number   | O número total de notificações deletadas |
| ids   | string[] | Os IDs das notificações                  |

## Update user

### PATCH `/api/users`

Atualize o objeto do usuário que corresponde ao JWT ou api-key, retorna o objeto
do usuário atualizado

#### JSON Params

| FIELD                | TYPE    | DESCRIPTION                                |
| -------------------- | ------- | ------------------------------------------ |
| bio                  | ?string | A biografia do usuário (1-200)             |
| notifications_viewed | boolean | Se as notificações do usuário foram vistas |
| banner_url           | string  | O URL do banner do usuário                 |
