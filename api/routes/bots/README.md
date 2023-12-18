# Bot Resources

## Bot Structure

| KEY               | TYPE                      | DESCRIPTION                                    |
| ----------------- | ------------------------- | ---------------------------------------------- |
| \_id              | Snowflake                 | O ID do bot                                    |
| name              | string                    | O nome do bot                                  |
| avatar            | ?string                   | O hash do avatar do bot                        |
| invite_url        | string                    | O URL do convite do bot                        |
| website_url?      | string                    | O URL do website do bot                        |
| support_server?   | string                    | O URL do servidor de suporte do bot            |
| source_code?      | string                    | O URL do código fonte do bot                   |
| short_description | string (50-80)            | A descrição curta do bot                       |
| long_description  | string (200-2048)         | A descrição longa do bot                       |
| prefixes          | string[]                  | Os prefixos do bot                             |
| owner_id          | Snowflake                 | O ID do dono do bot                            |
| created_at        | string                    | Uma data ISO string de quando o bot foi criado |
| verified          | boolean                   | Se o bot é verificado pelo Discord ou não      |
| tags              | string[]                  | As tags do bot                                 |
| approved          | boolean                   | Se o bot foi aprovado pela Simo Botlist ou não |
| api_key?          | string                    | A api-key **única** do bot                     |
| votes             | [Vote](#vote-structure)[] | Os votos do bot                                |
| banner_url        | ?string                   | O URL do banner do bot                         |
| team_id?          | string                    | O ID do time que o bot pertence                |
| vote_message      | ?string                   | A mensagem de voto personalizada do bot        |
| webhook_url?      | string                    | O URL do webhook usado para requisições do bot |

## Vote Structure

| KEY       | TYPE      | DESCRIPTION                                              |
| --------- | --------- | -------------------------------------------------------- |
| votes     | number    | O número total de votos que o usuário já fez no bot      |
| user_id   | Snowflake | O ID do usuário que o voto pertence                      |
| last_vote | string    | Uma data ISO string de quando o usuário votou por último |

## Feedback Structure

| KEY            | TYPE         | DESCRIPTION                                                         |
| -------------- | ------------ | ------------------------------------------------------------------- |
| author_id      | Snowflake    | O ID do autor do feedback                                           |
| stars          | number (1-5) | As estrelas do feedback                                             |
| posted_at      | string       | Uma data ISO string de quando o feedback foi postado                |
| content        | string       | O conteúdo do feedback                                              |
| target_bot_id  | Snowflake    | O ID do bot que o feedback pertence                                 |
| edited?        | boolean      | Se o feedback já foi editado alguma vez                             |
| reply_message? | object       | O objeto da [mensagem replicada](#feedback-message-reply-structure) |

## Feedback Message Reply Structure

| KEY       | TYPE    | DESCRIPTION                                                    |
| --------- | ------- | -------------------------------------------------------------- |
| content   | string  | O conteúdo da mensagem replicada                               |
| posted_at | string  | Uma data ISO string de quando a mensagem replicada foi postada |
| edited?   | boolean | Se a mensagem replicada já foi editada                         |

## Get Bot

### GET `/api/bots/{bot._id}`

Este método é usado para buscar um bot no banco de dado, retorna o objeto do
[bot](#bot-structure) encontrado

-   O cabeçalho `Authorization` não é necessário para essa rota

## Get Bots By Query

### GET `/api/bots`

Este método é usado para buscar vários bots no banco de dados, retorna uma array
de objeto de [bot](#bot-structure)

#### Query String Params

| FIELD    | TYPE      | DEFAULT |
| -------- | --------- | ------- |
| limit    | number    | 100     |
| verified | boolean   |         |
| start_at | number    | 0       |
| end_at   | number    |         |
| owner_id | Snowflake |         |
| team_id  | string    |         |

## List all user bots

### GET `/api/bots`

Este método é usado para pegar todos os bots do banco de dados que o autor da
requisição é o proprietário, retorna uma array de objeto de [bot](#bot-structure)

## Get Bot Votes

### GET `/api/bots/{bot._id}/votes`

Este método é usado para pegar todos os votos de um bot, retorna uma array de
objeto de [votos](#vote-structure)

### Example Response

```json
[
    {
        "votes": 4,
        "user_id": "963124227911860264",
        "last_vote": "2023-09-03T12:25:33.610Z"
    },
    {
        "votes": 1,
        "user_id": "786985391734390824",
        "last_vote": "2023-09-03T12:26:44.515Z"
    }
]
```

## Get Bot Feedbacks

### GET `/api/bots/{bot._id}/feedbacks`

Este método é usada para pegar todos os feedbacks já feitos em um bot, retorna
uma array de [feedbacks](#feedback-structure) com `author.username`,
`author.avatar` e `author.id`

## Get Bot Api-key

### GET `/api/bots/{bot._id}/api-key`

Pegue a api-key de um bot, retorna um objeto com `api-key`

-   Você deve ser o dono do bot para pegar essa propriedade

## Get Bot Webhook URL

### GET `/api/bots/{bot._id}/webhook`

Busque pelo webhook URL de um bot, retorna o webhook URL

-   Você deve ser o dono do bot para pegar essa propriedade

## Delete Bot

### DELETE `/api/bots/{bot._id}`

Este método é usado para deletar um bot no banco de dados, retorna o objeto do
[bot](#bot-structure) deletado

## Delete Feedback

### DELETE `/api/bots/{bot._id}/feedbacks`

Este método é usado para deletar um feedback de um bot, retorna uma estrutura JSON com `code`

-   O ID do usuário será pego do JWT ou api_key usado

## Patch Bot

### PATCH `/api/bots/{bot._id}`

Este método é usado para editar um bot, retorna o objeto do [bot](#bot-structure)
atualizado

#### JSON Params

| FIELD             | TYPE           | DESCRIPTION                                                                 |
| ----------------- | -------------- | --------------------------------------------------------------------------- |
| name              | string         | O nome do bot                                                               |
| avatar            | string         | O URL do avatar do bot                                                      |
| invite_url        | string         | O URL de invite do bot                                                      |
| website_url       | string         | O URL do website do bot                                                     |
| support_server    | string         | O URL de invite do bot (Apenas URL de servidores do Discord são aceitos)    |
| source_code       | string         | O URL do código-aberto do bot                                               |
| short_description | string         | A descrição curta (Deve conter entre 50-80 caracteres)                      |
| long_description  | string         | A descrição longa (Deve conter entre 200-500 caracteres, Markdown é válido) |
| prefixes          | string[]       | prefixos do bot (Use `/` para se referir a slash-commands)                  |
| verified          | boolean        | Se o bot é verificado ou não                                                |
| tags              | string[]       | As tags do bot                                                              |
| team_id           | string         | O ID do time que o bot pertence                                             |
| vote_message      | ?string (5-30) | Uma mensagem para quando um usuário votar                                   |
| webhook_url       | string         | O URL do webhook usado para requisições do bot                              |

-   Todas as propriedades são opicionais

## Patch Feedback

### PATCH `/api/bots/{bot._id}/feedbacks`

Este método é usado para editar um feedback em um bot, retorna o objeto do
[feedback](#feedback-structure) atualizado

-   O ID do usuário será pego do JWT ou api_key usado

#### JSON Params

| FIELD         | TYPE                                   | DESCRIPTION                        |
| ------------- | -------------------------------------- | ---------------------------------- |
| content       | string                                 | O conteúdo da mensagem do feedback |
| stars         | number (0-5)                           | O número de estrelas do feedback   |
| reply_message | [reply_message](/api/typings/types.ts) | A mensagem replicada               |

## Create Bot

### POST `/api/bots/{bot._id}`

Este método é usado para adicionar um bot no banco de dados, retorna o objeto do
[bot](#bot-structure) criado

#### JSON Params

| FIELD             | TYPE          | DEFAULT                                        | DESCRIPTION                                                                                       |
| ----------------- | ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| invite_url        | string        |                                                | O URL de convite do bot (Deve ser um URL válido)                                                  |
| website_url?      | string        |                                                | O URL do website do bot                                                                           |
| support_server?   | string        |                                                | O URL de convite do servidor de suporte do bot (Apenas URLs de servidores do Discord são aceitas) |
| source_code?      | string        |                                                | O URL do código-fonte do bot                                                                      |
| short_description | string        |                                                | A descrição curta (Deve conter entre 50-80 caracteres)                                            |
| long_description  | string        |                                                | A descrição longa (Deve conter entre 200-500 caracteres, Markdown é válido)                       |
| prefixes          | string[]      |                                                | Os prefixos do bot (Use `/` para se referir a slash-commands)                                     |
| verified          | boolean       |                                                | Se o bot é verificado ou não                                                                      |
| tags              | string[]      |                                                | As tags do bot                                                                                    |
| vote_message?     | string (5-30) | null                                           | Uma mensagem para quando alguém votar no bot                                                      |
| webhook_url?      | string        | O URL do webhook usado para requisições do bot |

## Add Vote

### POST `/api/bots/{bot._id}/votes`

Este método é usado para adicionar um voto no bot, retorna o objeto do [voto](#vote-structure)

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

### POST `/api/bots/{bot._id}/feedbacks`

Este método é usado para postar um feedback em um bot, retorna o objeto do [feedback](#feedback-structure)

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

## Test Vote Webhook

### POST `/api/bots/{bot._id}/webhook/test`

Essa rota ira mandar uma requisição para o `webhook_url` definido no objeto do bot.
O corpo da requisição será um objeto de [voto](#vote-structure)

-   A [api key](#bot-structure) do bot será mandada no cabeçalho `Authorization`
    da requisição
