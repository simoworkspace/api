# Team Resources

## Get teams user is in

### GET `/api/teams/@all`

Busque por todos os times onde o usuário é um membro, retorna uma array de times

## Get teams user owns

### GET `/api/teams`

Busque por todos os times onde o usuário é o proprietário, retorna uma array de times

## Get team

### GET `/api/teams/{team.id}`

Busque por um time, retorna uma estrutura de time

## Get team audit-logs

### GET `/api/teams/{team.id}/audit-logs`

Busque por todos os registros de auditoria de um time, retorna uma array de objetos
de registro de auditoria

## Change team owner

### PUT `/api/teams/{team.id}/change-owner/{member.id}`

Transfira a posse de um time para outro usuário, retorna o time atualizado

## Kick member

### PUT `/api/teams/{team.id}/members/{member.id}`

Expulse um membro do time, retorna a estrutura do membro removido

## Join team

### PUT `/api/teams/{team.id}/{team.invite_code}`

Entre em um time, retorna uma resposta `204: No Content` vazia

## Delete team

### DELETE `/api/teams/{team.id}`

Delete um time, retorna uma resposta `204: No Content` vazia

## Remove bot

### DELETE `/api/teams/{team.id}/bots/{bot._id}`

Remova um bot do time, retorna uma resposta `204: No Content` vazia

## Modify team

### PATCH `/api/teams/{team.id}`

Modifique um time, retorna o objeto do time atualizado

### JSON Params

| NAME        | TYPE          | DESCRIPTION                |
| ----------- | ------------- | -------------------------- |
| name        | string (3-15) | O nome do time             |
| description | string (5-50) | A descrição do time        |
| avatar_url  | string        | O URL do avatar do time    |
| invite_code | string        | O código de invite do time |

-   Todos os parâmetros são opicionais

## Modify member

### PATCH `/api/teams/{team.id}/members/{member.id}`

Modifique um membro de um time, retorna o objeto do membro atualizado

### JSON Params

| NAME       | TYPE         | DESCRIPTION                |
| ---------- | ------------ | -------------------------- |
| permission | number (0-1) | A nova permissão do membro |

-   Ressalvas
    -   Você não pode atualizar um membro que tem a mesma permissão que você
    -   Você não pode atualizar o proprietário do time

## Create team

### POST `/api/teams/{team.id}`

Crie um time, retorna o objeto do time criado

### JSON Params

| NAME         | TYPE          | DESCRIPTION                    |
| ------------ | ------------- | ------------------------------ |
| name         | string (3-15) | O nome do time                 |
| avatar_url   | string        | O URL do avatar do time        |
| description? | string        | A descrição do time            |
| bot_ids      | Snowflake[]   | O bot que pertence a esse time |

-   Ressalvas
    -   Você só pode ter 2 times no máximo
    -   Você deve ser proprietário do bot e o bot já deve estar adicionado em [Simo Botlist](bombadeagua.life)

## Add bot

### POST `/api/teams/{team.id}/bots/{bot._id}`

Adicione um bot em um time, retorna o objeto do time desatualizado
