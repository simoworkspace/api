# Bot Resources

## Get Bot

### GET `/api/bots/{botId}`

Este método é usado para buscar um bot no banco de dados ou na API do Discord, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)

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

## Check If a Bot Exists

### GET `/api/bots/{botId}/exists` (DEPRECATED)

Este método é usado para verificar se um bot existe no banco de dados, retorna um booleano

#### Example Response Structure

```json
{
    "exists": false
}
```

## List All Bots

### GET `/api/bots`

Este método é usado para pegar todos os bots do banco de dados, retorna uma Array de [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de bot

## Get Bot Votes

### GET `/api/bots/{botId}/votes`

Este método é usado para pegar todos os votos de um bot, retorna uma Array de votos

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

## Get Vote Status

### GET `/api/bots/{botId}/vote-status/{userId}`

Este método retorna o status de voto de um usuário em um bot

#### Example Response Structure

```json
{
    "can_vote": true
}
```

-   `rest_time` não é retornado quando `can_vote` é `true`

## Get Bot Feedbacks

### GET `/api/bots/{botId}/feedbacks`

Este método é usada para pegar todos os feedbacks já feitos em um bot, retorna uma Array de [feedbacks](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113)

## Delete Bot

### DELETE `/api/bots/{botId}`

Este método é usado para deletar um bot no banco de dados, retorna uma estrutura de [bot](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7)

## Delete Feedback

### DELETE `/api/bots/{botId}/feedbacks/{userId}`

Este método é usado para deletar um feedback de um bot, retorna uma estrutura JSON com `code`

## Patch Bot

### PATCH `/api/bots/{botId}`

Este método é usado para editar um bot, retorna o objeto do pode desatualizado

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
| owners            | Snowflake[]                                                                                              | Os IDs dos desenvolvedores/donos bot bot                                    |
| verified          | boolean                                                                                                  | Se o bot é verificado ou não                                                |
| tags              | string[]                                                                                                 | As tags do bot                                                              |
| votes             | [VoteStructure](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L47)[] | Array de votos do bot                                                       |
| banner_url        | string                                                                                                   | URL do banner do bot                                                        |
| team_id           | string                                                                                                   | O ID do time que o bot pertence                                             |

-   Todas as propriedades são opicionais

## Patch Feedback

### PATCH `/api/bots/{botId}/feedbacks/{userId}`

Este método é usado para editar um feedback em um bot, retorna uma estrutura de [feedback](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113)

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

| FIELD             | TYPE                                                                                                     | DEFAULT                   | DESCRIPTION                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| name              | string                                                                                                   |                           | O nome do bot                                                                                     |
| avatar            | string                                                                                                   |                           | The avatar URL of the bot                                                                         |
| invite_url        | string                                                                                                   |                           | O URL de convite do bot (Deve ser um URL válido)                                                  |
| website_url?      | string                                                                                                   |                           | O URL do website do bot                                                                           |
| support_server?   | string                                                                                                   |                           | O URL de convite do servidor de suporte do bot (Apenas URLs de servidores do Discord são aceitas) |
| source_code?      | string                                                                                                   |                           | O URL do código-fonte do bot                                                                      |
| short_description | string                                                                                                   |                           | A descrição curta (Deve conter entre 50-80 caracteres)                                            |
| long_description  | string                                                                                                   |                           | A descrição longa (Deve conter entre 200-500 caracteres, Markdown é válido)                       |
| prefixes          | string[]                                                                                                 |                           | Os prefixos do bot (Use `/` para se referir a slash-commands)                                     |
| owners            | Snowflake[]                                                                                              |                           | Os IDs dos desenvolvedores/donos do bot                                                           |
| created_at        | ISO8601 timestamp                                                                                        |                           | A data de criação do bot                                                                          |
| verified          | string                                                                                                   |                           | Se o bot é verificado ou não                                                                      |
| tags              | string[]                                                                                                 |                           | As tags do bot                                                                                    |
| approved          | string[]                                                                                                 |                           | Se o bot já foi aprovado                                                                          |
| votes?            | [VoteStructure](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L47)[] | []                        | Array de votos do bot                                                                             |
| banner_url?       | string                                                                                                   | Novo URL do banner do bot |

## Add Vote

### POST `/api/bots/{botId}/votes`

Este método é usado para adicionar um voto no bot, retorna uma estrutura de [voto](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L62)

#### JSON Params

| FIELD | TYPE      | DESCRIPTION             |
| ----- | --------- | ----------------------- |
| user  | Snowflake | O usuário que irá votar |

#### Example

```ts
const body = {
    user: "963124227911860264",
};

fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
});
```

## Add Feedback

### POST `/api/bots/{botId}/feedbacks/{userId}`

Este método é usado para postar um feedback em um bot, retorna uma estrutura de [feedback](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/core/types/types.d.ts#L113)

#### JSON Params

| FIELD   | TYPE      | DEFAULT |
| ------- | --------- | ------- |
| stars   | int (0-5) | Nenhum  |
| content | string    | Nenhum  |

```ts
fetch(url, {
    method: "POST",
    body: JSON.stringify({
        stars: 5,
        content: "Pablo bot é um bot incrível",
    }),
});
```
