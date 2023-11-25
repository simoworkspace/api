# Team Resources

## Get team

### GET `/api/teams/{team.id}`

Busque por um time na database, retorna uma estrutura de time

## Get user teams

### GET `/api/teams`

Busque pelo time do usuário, retorna uma estrutura de time

-   A API tentara encontrar o time pela api_key ou json web token usado

## Get all user teams

### GET `/api/teams/@all`

Busque por todos os times que o usuário está, retorna uma array de estruturas de
time

-   A API tentara encontrar o time pela api_key ou json web token usado

## Delete team

### DELETE `/api/teams`

Delete um time na database, retorna uma resposta vazia

-   A API tentara encontrar o time pela api_key ou json web token usado

## Create team

### POST `/api/teams`

Crie um time, retorna o objeto do time com um `id` e `members`

#### JSON Params

| FIELD        | TYPE      | DESCRIPTION                     |
| ------------ | --------- | ------------------------------- |
| name         | string    | O nome to time (3-15)           |
| avatar_url   | string    | O URL do avatar do time         |
| description? | string    | A descrição do time (5-50)      |
| bot_id       | Snowflake | O ID do bot que o time pertence |

-   \* O owner é definido como o autor da requisição

-   Requirements:
    -   Você não pode já estar em um time
    -   O bot usado não pode estar em um time ou adicionado na botlist

## Update team

### PATCH `/api/teams`

Edite/atualize um time, retorna o objeto do time atualizado

#### JSON Params

| FIELD       | TYPE      | DESCRIPTION                |
| ----------- | --------- | -------------------------- |
| name        | string    | O nome do time (3-15)      |
| avatar_url  | string    | O URL do avatar do time    |
| description | string    | A descrição do time (5-50) |
| bot_id      | Snowflake | O ID do bot do time        |

-   Todas as propriedades são opcionais
-   A API tentara encontrar o time pela api_key ou json web token usado

## Join team

### PUT `/api/teams/{team.id}/{team.invite_code}`

Entre para um time, retorna `true` se entrou

-   O usuário não pode já ser um membro do time

## Transfer ownership

### PUT `/api/teams/change-owner/{user._id}`

Transfira a posse do time para outro usuário

-   O usuário tem que ser um membro
-   Você não pode transferir para você mesmo
-   O usuário não pode ser proprietario de um time

## Remove member

### PUT `/api/teams/{team.id}/remove-member`

Remova um membro do time

### JSON Params

| FIELD     | TYPE      | DESCRIPTION                      |
| --------- | --------- | -------------------------------- |
| member_id | Snowflake | O ID do membro que será removido |

-   Ressalvas
    -   Você precisa ser um administrador
    -   Você não pode expulsar o proprietário do time
    -   Você não pode expulsar um administrador se você é um administrador
