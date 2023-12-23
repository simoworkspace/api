# Audit-Log Resource

## Audit-Log

Um registro de auditoria é qualquer ação moderativa feita/criada por um moderador em um [time](/api/routes/teams/README.md#team-structure), então uma [entrada](#audit-log-entry-structure) é criada no registro de auditoria. Para membros de um time poderem ver o registro de auditoria, o membro precisa ser um moderador ou o proprietário do time. Você pode obter os registros de auditoria de um time a partir da rota [`GET /api/teams/{team.id}/audit-logs`](#get-team-audit-logs). Os registros de auditoria são armazenados até ter 50 entradas, a partir disso a última entrada é deletada para a nova poder ser adicionada.

Algumas rotas suporta o cabeçalho `X-Audit-Log-Reason` para poder adicionar uma razão na entrada que será criada.

## Audit-Log Structure

| KEY     | TYPE                                          | DESCRIPTION                           |
| ------- | --------------------------------------------- | ------------------------------------- |
| team_id | string                                        | O ID do time que o audit-log pertence |
| entries | [AuditLogEntry](#audit-log-entry-structure)[] | As entradas do time                   |

## Audit-Log Entry Structure

| KEY         | TYPE                                                       | DESCRIPTION                                                |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| executor_id | Snowflake                                                  | O ID do usuário que criou a entrada                        |
| created_at  | string                                                     | A data ISO string de quando a entrada foi criada           |
| id          | string                                                     | O ID da entrada                                            |
| action_type | number                                                     | O [tipo da ação](#audit-log-entry-action-types) da entrada |
| changes     | [AuditLogEntryChange](#audit-log-entry-change-structure)[] | As alterações feita na entrada                             |
| target_id?  | Snowflake                                                  | O ID do alvo da entrada                                    |
| reason?     | string (1-428)                                             | A razão da ação                                            |

## Audit-Log Entry Action Types

| NAME                  | VALUE | DESCRIPTION                                |
| --------------------- | ----- | ------------------------------------------ |
| MemberAdd             | 0     | Um membro foi adicionado no time           |
| MemberRemove          | 1     | Um membro foi expulso do time              |
| MemberUpdate          | 2     | As permissões de um membro foi alterada    |
| TeamOwnershipTransfer | 3     | A posse do time foi transferida            |
| TeamUpdate            | 4     | O time foi editado                         |
| BotAdd                | 5     | Um bot foi adicionado ao time              |
| BotRemove             | 6     | Um bot foi expulso do time                 |
| InviteUpdate          | 7     | O código de convite do time foi atualizado |
| MemberAutoKick        | 8     | Um membro saiu do time                     |

## Audit-Log Entry Change Structure

| KEY         | TYPE             | DESCRIPTION                      |
| ----------- | ---------------- | -------------------------------- |
| changed_key | string           | A chave que foi alterada         |
| old_data    | string \| number | O valor antido da chave alterada |
| new_data?   | string \| number | O novo valor da chave alterada   |

## Get team audit-logs

### GET `/api/teams/{team.id}/audit-logs`

Busque por todos os registros de auditoria de um time, retorna o objeto de [registro de auditoria](#audit-log-structure) do time com `_id`, `avatar` e `username` do `target` e `executor`

#### Query String Params

| FILED        | TYPE      | DESCRIPTION                                               |
| ------------ | --------- | --------------------------------------------------------- |
| executor_id? | snowflake | Entradas feitas por esse usuário                          |
| action_type? | number    | Entras pelo [tipo de ação](#audit-log-entry-action-types) |
| target_id?   | snowflake | Entradas pelo ID do alvo da ação                          |
| start_at?    | number    | Entradas depois de certo índice                           |
| end_at?      | number    | Entras até certo índice                                   |
