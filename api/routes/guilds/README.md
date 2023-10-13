# Guild Resources

## Get guild

### GET `/api/guilds/{guildId}`

Este método é usado para buscar uma guilda no banco de dados, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de guilda.

#### Example Response Structure

```json
{
    "_id": "963067593479057468",
    "verificationChannel": "988397828063772762",
    "logsChannel": "988397828063772762",
    "owners": ["963124227911860264"]
}
```

## Delete a guild

### DELETE `/api/guilds/{guildId}`

Este método é usado para deletar uma guilda no banco de dados, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de guilda.

## Patch a guild

### PATCH `/api/guilds/{guildId}`

Este método é usado para editar uma guilda no banco de dados, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de guilda.

#### JSON Params

| FIELD                    | TYPE        | DESCRIPTION                     |
| ------------------------ | ----------- | ------------------------------- |
| verification_channel_id? | Snowflake   | O ID do canal de verificação    |
| logs_channel_id?         | Snowflake   | O ID do canal de logs           |
| add_bot_channel_id?      | Snowflake   | O ID do canal de adicionar bots |
| owners                   | Snwoflake[] | Os IDs dos donos da guilda      |

## Create a guild

### POST `/api/guilds/{guildId}`

Este método é usado para adicionar uma guilda no banco de dados, retorna uma [estrutura](https://github.com/Simo-Workspace/Botlist-Api/blob/main/src/typings/index.d.ts#L7) de guilda.

#### JSON Params

| FIELD                   | TYPE        | DESCRIPTION                     |
| ----------------------- | ----------- | ------------------------------- |
| \_id                    | Snowflake   | O ID do servidor                |
| verification_channel_id | Snowflake   | O ID do canal de verificação    |
| logs_channel_id         | Snowflake   | O ID do canal de logs           |
| add_bot_channel_id?     | Snowflake   | O ID do canal de adicionar bots |
| owners                  | Snowflake[] | Os IDs dos donos da guilda      |
