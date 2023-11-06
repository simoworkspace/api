# Team Resources

## Get team

### GET `/api/teams/{teamId}`

Busque por um time na database, retorna uma estrutura de time

## Delete team

### DELETE `/api/teams`

Delete um time na database, retorna uma resposta vazia

-   A API tentara encontrar o time pela api_key ou json web token usado

## Create team

### POST `/api/teams`

Crie um time, retorna o objeto do time com um `id`

#### JSON Params

| FIELD        | TYPE                                 | DESCRIPTION                     |
| ------------ | ------------------------------------ | ------------------------------- |
| members      | [member](/api/typings//types.ts)[]\* | Os membros do time              |
| name         | string                               | O nome to time (3-15)           |
| avatar_url   | string                               | O URL do avatar do time         |
| description? | string                               | A descrição do time (5-50)      |
| bot_id       | Snowflake                            | O ID do bot que o time pertence |

-   \* Ao menos um membro deve ter a propriedade `owner` com valor `true`

-   Requirements:
    -   Você não pode já estar em um time
    -   O bot usado não pode estar em um time ou adicionado na botlist

## Update team

### PATCH `/api/teams`

Edite/atualize um time, retorna o objeto do time atualizado

#### JSON Params

| FIELD       | TYPE                              | DESCRIPTION                |
| ----------- | --------------------------------- | -------------------------- |
| name        | string                            | O nome do time (3-15)      |
| avatar_url  | string                            | O URL do avatar do time    |
| description | string                            | A descrição do time (5-50) |
| members     | [member](/api/typings/types.ts)[] | Os membros do time         |

-   Todas as propriedades são opcionais
-   A API tentara encontrar o time pela api_key ou json web token usado
