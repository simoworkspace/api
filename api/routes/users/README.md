# User Resources

## User Structure

| KEY                  | TYPE      | DESCRIPTION                                                                |
| -------------------- | --------- | -------------------------------------------------------------------------- |
| \_id                 | Snowflake | O ID do usuário                                                            |
| username             | string    | O nome de usuário do usuário                                               |
| avatar               | ?string   | O hash do avatar do usuário                                                |
| bio                  | ?string   | A biografia do usuário                                                     |
| notifications_viewed | boolean   | Se as notificações foram vistas pelo usuário                               |
| banner_url           | ?string   | O URL do banner do usuário (GIFs suportados)                               |
| flags                | number    | As ["flags"](#user-flags) do usuário                                       |
| premium_type         | number    | O [tipo de premium](#premium-types) do usuário                             |
| notifications        | Map       | As notificações do usuário                                                 |
| locale?              | string    | O [idioma](/api/README.md#locales) que o usuário escolheu (padrão `pt-BR`) |

### Example User Structure

```json
{
    "_id": "963124227911860264",
    "username": "meunreal",
    "avatar": "1f42e6dc5631724994ee7ea819371036",
    "notifications": {},
    "bio": "I updated my biography on 13/11/2024",
    "notifications_viewed": true
}
```

## User Flags

| KEY            | VALUE  | DESCRIPTION                     |
| -------------- | ------ | ------------------------------- |
| None           | 0 << 0 | O usuário não tem nenhuma badge |
| BugHunter      | 1 << 0 | O usuário é um Bug Hunter       |
| Contributor    | 1 << 1 | O usuário é um contribuidor     |
| PremiumPartner | 1 << 2 | O usuário é um usuário premium  |
| Developer      | 1 << 3 | O usuário é um desenvolvedor    |

## Premium Types

| KEY      | VALUE |
| -------- | ----- |
| None     | 0     |
| Basic    | 1     |
| Advanced | 2     |

## Notification Structure

| KEY     | TYPE   | DESCRIPTION                                                                        |
| ------- | ------ | ---------------------------------------------------------------------------------- |
| content | string | O conteúdo da notificação                                                          |
| sent_at | string | Uma data ISO string de quando a notificação foi criada                             |
| type    | number | O [tipo da notificação](#notification-types)                                       |
| url?    | string | O hyperlink da notificação (Disponível somente com [Comment](#notification-types)) |

## Notification Types

| KEY      | VALUE |
| -------- | ----- |
| Comment  | 0     |
| Approved | 1     |
| Refused  | 2     |
| Mixed    | 3     |

## Get user

### GET `/api/users/{user._id}`

Busque por um usuário na database, retorna um objeto de [usuário](#user-structure)

-   `notifications` será `null` se o ID do usuário for diferente do ID do autor da
    requisição
-   O cabeçalho `Authorization` não é necessário para essa rota

## Get current user

### GET `/api/users/@me`

Busque pelo autor da requisição, retorna objeto de [usuário](#user-structure)

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

#### JSON Response

| FIELD | TYPE     | DESCRIPTION                              |
| ----- | -------- | ---------------------------------------- |
| count | number   | O número total de notificações deletadas |
| ids   | string[] | Os IDs das notificações                  |

## Update user

### PATCH `/api/users`

Atualize o objeto do usuário que corresponde ao JWT ou api-key, retorna um objeto
de [usuário](#user-structure)

#### JSON Params

| FIELD                | TYPE    | DESCRIPTION                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| bio                  | ?string | A biografia do usuário (1-200)                            |
| notifications_viewed | boolean | Se as notificações do usuário foram vistas                |
| banner_url           | ?string | O URL do banner do usuário                                |
| locale               | string  | O [idioma](/api/README.md#locales) escolhido pelo usuário |

-   Todos os parâmetros são opcionais
