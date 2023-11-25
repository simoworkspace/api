# Bot Resources

## Get Bot

### GET `/api/bots/{botId}`

Este método é usado para buscar um bot no banco de dado, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de bot

## Get Bots By Query

### GET `/api/bots/{botId}`

Este método é usado para buscar vários bots no banco de dados, retorna uma Array de [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)

#### Query String Params

| FIELD             | TYPE              | DEFAULT |
| ----------------- | ----------------- | ------- |
| \_id              | Snowflake         | None    |
| limit             | integer           | 500     |
| name              | string            | None    |
| avatar            | string            | None    |
| invite_url        | string            | None    |
| website_url       | string            | None    |
| source_code       | string            | None    |
| short_description | string            | None    |
| long_description  | string            | None    |
| created_at        | ISO8601 timestamp | None    |
| startAt           | integer           | None    |
| endAt             | integer           | None    |

## List all user bots

### GET `/api/bots`

Este método é usado para pegar todos os bots do banco de dados que o autor da
requisição é o proprietário, retorna uma array de
[estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)
de bot

## Get Bot Votes

### GET `/api/bots/{botId}/votes`

Este método é usado para pegar todos os votos de um bot, retorna uma array de votos

### Example Response

```json
[
    {
        "votes": 4,
        "user": "963124227911860264",
        "last_vote": "2023-09-03T12:25:33.610Z"
    },
    {
        "votes": 1,
        "user": "786985391734390824",
        "last_vote": "2023-09-03T12:26:44.515Z"
    }
]
```

## Get Bot Feedbacks

### GET `/api/bots/{botId}/feedbacks`

Este método é usada para pegar todos os feedbacks já feitos em um bot, retorna uma array de [feedbacks](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113) com `author.username`, `author.avatar` e `author.id`

## Delete Bot

### DELETE `/api/bots/{botId}`

Este método é usado para deletar um bot no banco de dados, retorna uma estrutura de [bot](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)

## Delete Feedback

### DELETE `/api/bots/{botId}/feedbacks`

Este método é usado para deletar um feedback de um bot, retorna uma estrutura JSON com `code`

-   O ID do usuário será pego do JWT ou api_key usado

## Patch Bot

### PATCH `/api/bots/{botId}`

Este método é usado para editar um bot, retorna o objeto do bot atualizado

#### JSON Params

| FIELD             | TYPE                                                                                                     | DESCRIPTION                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| name              | string                                                                                                   | O nome do bot                                                               |
| avatar            | string                                                                                                   | O URL do avatar do bot                                                      |
| invite_url        | string                                                                                                   | O URL de invite do bot                                                      |
| website_url       | string                                                                                                   | O URL do website do bot                                                     |
| support_server    | string                                                                                                   | O URL de invite do bot (Apenas URL de servidores do Discord são aceitos)    |
| source_code       | string                                                                                                   | O URL do código-aberto do bot                                               |
| short_description | string                                                                                                   | A descrição curta (Deve conter entre 50-80 caracteres)                      |
| long_description  | string                                                                                                   | A descrição longa (Deve conter entre 200-500 caracteres, Markdown é válido) |
| prefixes          | string[]                                                                                                 | prefixos do bot (Use `/` para se referir a slash-commands)                  |
| verified          | boolean                                                                                                  | Se o bot é verificado ou não                                                |
| tags              | string[]                                                                                                 | As tags do bot                                                              |
| banner_url        | string                                                                                                   | URL do banner do bot                                                        |
| team_id           | string                                                                                                   | O ID do time que o bot pertence                                             |
| vote_message      | string (5-30)                                                                                            | Uma mensagem para quando um usuário votar                                   |

-   Todas as propriedades são opicionais

## Patch Feedback

### PATCH `/api/bots/{botId}/feedbacks`

Este método é usado para editar um feedback em um bot, retorna uma estrutura de [feedback](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113)

-   O ID do usuário será pego do JWT ou api_key usado

#### JSON Params

| FIELD         | TYPE                                   | DESCRIPTION                        |
| ------------- | -------------------------------------- | ---------------------------------- |
| content       | string                                 | O conteúdo da mensagem do feedback |
| stars         | number (0-5)                           | O número de estrelas do feedback   |
| reply_message | [reply_message](/api/typings/types.ts) | A mensagem replicada               |

## Create Bot

### POST `/api/bots/{botId}`

Este método é usado para adicionar um bot no banco de dados, retorna uma estrutura de [bot](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)

#### JSON Params

| FIELD             | TYPE                                                                                                     | DEFAULT                              | DESCRIPTION                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| invite_url        | string                                                                                                   |                                      | O URL de convite do bot (Deve ser um URL válido)                                                  |
| website_url?      | string                                                                                                   |                                      | O URL do website do bot                                                                           |
| support_server?   | string                                                                                                   |                                      | O URL de convite do servidor de suporte do bot (Apenas URLs de servidores do Discord são aceitas) |
| source_code?      | string                                                                                                   |                                      | O URL do código-fonte do bot                                                                      |
| short_description | string                                                                                                   |                                      | A descrição curta (Deve conter entre 50-80 caracteres)                                            |
| long_description  | string                                                                                                   |                                      | A descrição longa (Deve conter entre 200-500 caracteres, Markdown é válido)                       |
| prefixes          | string[]                                                                                                 |                                      | Os prefixos do bot (Use `/` para se referir a slash-commands)                                     |
| created_at        | ISO8601 timestamp                                                                                        |                                      | A data de criação do bot                                                                          |
| verified          | boolean                                                                                                  |                                      | Se o bot é verificado ou não                                                                      |
| tags              | string[]                                                                                                 |                                      | As tags do bot                                                                                    |
| banner_url?       | string                                                                                                   |                                      | Novo URL do banner do bot                                                                         |
| vote_message?     | string (5-30)                                                                                            | "Obrigado por votar em ${this.name}" | Uma mensagem para quando alguém votar no bot                                                      |

## Add Vote

### POST `/api/bots/{botId}/votes`

Este método é usado para adicionar um voto no bot, retorna todos os votos do bot com o novo voto adicionado

-   O ID do usuário será pego do JWT ou api_key usado

#### Example

```ts
fetch(url, {
    method: "POST",
    headers: {
        Authorization: "6jija02kl0bfda-e8jb0lad6bje0c-5awdsa38eezzb",
    },
});
```

## Add Feedback

### POST `/api/bots/{botId}/feedbacks`

Este método é usado para postar um feedback em um bot, retorna uma estrutura de [feedback](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113)

#### JSON Params

| FIELD   | TYPE      | DEFAULT |
| ------- | --------- | ------- |
| stars   | int (0-5) | Nenhum  |
| content | string    | Nenhum  |

-   O ID do usuário será pego do JWT ou api_key usado

```ts
fetch(url, {
    method: "POST",
    body: JSON.stringify({
        stars: 5,
        content: "Pablo bot é um bot incrível",
    }),
});
```
