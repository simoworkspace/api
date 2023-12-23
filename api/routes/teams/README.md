# Team Resources

## Team Structure

| KEY         | TYPE                                   | DESCRIPTION                                                        |
| ----------- | -------------------------------------- | ------------------------------------------------------------------ |
| members     | [TeamMember](#team-member-structure)[] | Os membros do time                                                 |
| id          | string                                 | O ID único do time                                                 |
| invite_code | string                                 | O código de convite do time                                        |
| name        | string                                 | O nome do time                                                     |
| avatar_url  | string                                 | O URL do avatar do time                                            |
| description | ?string                                | A descrição do time                                                |
| bots_id     | Snowflake[]                            | Os IDs dos bots que estão no time                                  |
| vanity_url? | object                                 | O objeto do [convite personalizado](#vanity-url-structure) do time |
| created_at  | string                                 | Uma data ISO string de quando o time foi criado                    |

## Team Member Structure

| KEY        | TYPE      | DESCRIPTION                                               |
| ---------- | --------- | --------------------------------------------------------- |
| id         | Snowflake | O ID do membro                                            |
| permission | number    | A [permissão](#team-member-permissions) do membro no time |
| joined_at  | string    | Uma data ISO string de quando o membro entrou no time     |

## Team Member Permissions

| KEY           | VALUE |
| ------------- | ----- |
| Administrator | 0     |
| ReadOnly      | 1     |
| Owner         | 2     |

## Vanity URL Structure

| KEY  | TYPE   | DESCRIPTION                              |
| ---- | ------ | ---------------------------------------- |
| code | string | O código de convite **único** do time    |
| uses | number | O tanto de vezes que o convite foi usado |

## Get teams user is in

### GET `/api/teams/@all`

Busque por todos os times onde o usuário é um membro, retorna uma array de times
de objeto de [times](#team-structure)

## Get teams user owns

### GET `/api/teams`

Busque por todos os times onde o usuário é o proprietário, retorna uma array de
objeto de [times](#team-structure)

## Get team

### GET `/api/teams/{team.id}`

Busque por um time, retorna o objeto do [time](#team-structure)

## Get team bots

### GET `/api/teams/{team.id}/bots`

Busque por todos os bots de um time, retorna uma array de objetos parciais

### Example Response Structure

```json
[
    {
        "_id": "504095380166803466",
        "tags": ["Sharing", "dasdasssada", "asdasdsadasdass"],
        "name": "Super compiler",
        "avatar": "873f5737ee82b45caaa34e079f3e164b",
        "votes": [
            {
                "user_id": "955095844275781693",
                "last_vote": "2023-11-25T19:42:10.999Z",
                "votes": 27
            }
        ],
        "short_description": "Meu Bot de Receitas é um bot Discord que pode ajudar
        você a descobrir novas receitas e compartilhar suas próprias criações!"
    }
]
```

## Get team members

### GET `/api/teams/{team.id}/members`

Busque por todos os membros de um time, retorna uma array de objeto de [membros](#team-member-structure)

## Get me

### GET `/api/teams/{team.id}/members/@me`

Busque pelo membro que corresponde ao Json Web Token ou api-key, retorna o objeto
do [membro](#team-member-structure)

## Get member

### GET `/api/teams/{team.id}/members/{member.id}`

Busque por um membro de um time, retorna o objeto do
[membro](#team-member-structure) encontrado

## Get team vanity URL

Retorna um objeto de [vanity url](#vanity-url-structure). Retorna um

## Change team owner

### PUT `/api/teams/{team.id}/change-owner/{member.id}`

Transfira a posse de um time para outro usuário, retorna o objeto do
[time](#team-structure) atualizado

> Está rota suporta o cabeçalho `X-Audit-Log-Reason`

## Join team

### PUT `/api/teams/{team.id}/{team.invite_code}`

Entre em um time, retorna uma resposta `204: No Content` vazia

## Delete team

### DELETE `/api/teams/{team.id}`

Delete um time, retorna uma resposta `204: No Content` vazia

## Remove bot

### DELETE `/api/teams/{team.id}/bots/{bot.id}`

Remova um bot do time, retorna uma resposta `204: No Content` vazia

## Kick member

### DELETE `/api/teams/{team.id}/members/{member.id}`

Expulse um membro do time, retorna o objeto do [membro](#team-member-structure) removido

> Está rota suporta o cabeçalho `X-Audit-Log-Reason`

## Leave team

### DELETE `/api/teams/{team.id}/leave`

Saía de um time, retorna uma resposta `204: No Content` vazia

## Modify team

### PATCH `/api/teams/{team.id}`

Modifique um time, retorna o objeto do [time](#team-structure) atualizado

### JSON Params

| NAME            | TYPE          | DESCRIPTION                       |
| --------------- | ------------- | --------------------------------- |
| name            | string (3-15) | O nome do time                    |
| description     | string (5-50) | A descrição do time               |
| avatar_url      | string        | O URL do avatar do time           |
| vanity_url_code | string (1-16) | O URL de invite intuitivo do time |

-   Todos os parâmetros são opicionais

## Modify member

### PATCH `/api/teams/{team.id}/members/{member.id}`

Modifique um membro de um time, retorn um objeto de [membro](#team-member-structure)

### JSON Params

| NAME       | TYPE         | DESCRIPTION                |
| ---------- | ------------ | -------------------------- |
| permission | number (0-1) | A nova permissão do membro |

> Está rota suporta o cabeçalho `X-Audit-Log-Reason`

-   Ressalvas
    -   Você não pode atualizar um membro que tem a mesma permissão que você
    -   Você não pode atualizar o proprietário do time

## Update invite code

### PATCH `/api/teams/{team.id}/invite`

Atualize o código de convite de um time, retorna um objeto com `invite_code`

## Create team

### POST `/api/teams`

Crie um time, retorna um objeto de [time](#team-structure)

### JSON Params

| NAME         | TYPE          | DESCRIPTION             |
| ------------ | ------------- | ----------------------- |
| name         | string (3-15) | O nome do time          |
| avatar_url   | string        | O URL do avatar do time |
| description? | string        | A descrição do time     |

-   Ressalvas
    -   Você só pode ter 2 times no máximo sem premium

## Add bot

### POST `/api/teams/{team.id}/bots/{bot.id}`

Adicione um bot em um time, retorn um objeto de [time](#team-structure) desatualizado

-   Você deve ser o proprietário do bot para adicionar ele em um time
