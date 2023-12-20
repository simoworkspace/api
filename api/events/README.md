# Socket

## Connecting

Antes de qualquer coisa, você deverá usar uma biblioteca de terceiros ou uma biblioteca oficial do Simo, como [simo.js](https://www.npmjs.com/package/simo.js) e escutar os eventos por lá.

Para se conectar ao socket da API, você deve passar as propriedades `auth` com o autenticador do seu bot e `events` como todos os eventos que você deseja receber.

### Parameters

| KEY    | TYPE     | DESCRIPTION                                         |
| ------ | -------- | --------------------------------------------------- |
| auth   | string   | O autenticador único do seu bot                     |
| events | number[] | Uma array de tipos de eventos que você quer receber |

## Hello Event

Uma vez que conectado com o socket, será emitido um evento chamado [Hello](#hello-event) que contém o autenticador usado pelo seu bot e para informar que o socket se conectou com o cliente.

### Example Hello Event

```json
{
    "type": 1,
    "event_type": null,
    "payload": {
        "auth": "34202jj130db3-a556ifh1464b-88d3fef0ge6ff"
    }
}
```

## Invalid Connection Event

Uma vez que a propriedade `auth` ou `events` é passada errada, será emitido um evento chamado [Invalid connection](#invalid-connection-event) que contém o payload como a mensagem de [erro](/api/README.md#erros).

## Events

### Opcodes

Todos os eventos enviados tem um [código de operação](#opcodes) para saber o tipo de dado que está sendo enviado.

| CODE | NAME              | DESCRIPTION                                                      |
| ---- | ----------------- | ---------------------------------------------------------------- |
| 0    | Payload           | Um evento foi despachado e uma carga útil foi enviada            |
| 1    | Hello             | O cliente se conectou com o socket                               |
| 2    | InvalidConnection | O cliente passou alguma informação errada na hora de conectar-se |

### Event Names

Todos os eventos usam a convenção [camel case](https://pt.wikipedia.org/wiki/CamelCase). Por exemplo, `TeamUpdate` será `teamUpdate`.

### Event Data

| KEY        | TYPE           | DESCRIPTION                                                |
| ---------- | -------------- | ---------------------------------------------------------- |
| type       | number         | Um [código de operação](#opcodes)                          |
| event_type | ?number        | O tipo do evento, usado para indiciar o tipo da carga útil |
| payload    | object \| null | Carga útil do evento                                       |

#### Example Event Data

```json
{
    "type": 2,
    "event_type": null,
    "payload": {
        "message": "Unknown connection",
        "code": 7002
    }
}
```

### Receiving Events

a

#### User Update

Enviado quando as propriedades do usuário atual é alterada. Carga útil é um objeto de [usuário](/api/routes/users/README.md#user-structure)

#### Bulk Delete Notifications

Enviado quando todas as notificações do usuário foram deletadas em massa

##### Bulk Delete Notifications Fields

| FIELD | TYPE     | DESCRIPTION                              |
| ----- | -------- | ---------------------------------------- |
| count | number   | O número total de notificações deletadas |
| ids   | string[] | Os IDs das notificações                  |

#### Notification Delete

Enviado quando uma notificação do usuário atual foi deletada. Carga útil é um objeto de [notificação](/api/routes/users/README.md#notification-structure) com `user_id` do dono da notificação.

#### Notification Create

Enviado quando uma notificação é criada para o usuário atual. Carga útil é um objeto de [notificação](/api/routes/users/README.md#notification-structure) com `user_id` do dono da notificação.

#### Team Bot Add

Enviado quando um bot é adicionado em um [time](/api/routes/teams/README.md#team-structure). Carga útil é um [objeto](/api/routes/teams/README.md#team-structure) de time com `bot_id` do bot adicionado.

#### Team Bot Remove

Enviado quando um bot é removido de um [time](/api/routes/teams/README.md#team-structure).

##### Team Bot Remove Fields

| FIELD   | TYPE      | DESCRIPTION                         |
| ------- | --------- | ----------------------------------- |
| bot_id  | Snowflake | O ID do bot que foi removido        |
| team_id | string    | O ID do time que o bot foi removido |

#### Team Ownership Transfer

Enviado quando a posse de um [time](/api/routes/teams/README.md#team-structure) é transferida. Carga útil é um objeto de [time](/api/routes/teams/README.md#team-structure) com `old_owner_id` do ID do antigo proprietário do time.

#### Team Create

Enviado quando um [time](/api/routes/teams/README.md#team-structure) é criado. Carga útil é o objeto do [time](/api/routes/teams/README.md#team-structure) criado.

#### Team Delete

Enviado quando um [time](/api/routes/teams/README.md#team-structure) é deletado. Carga útil é o objeto do [time](/api/routes/teams/README.md#team-structure) deletado

#### Team Update

Enviado quando as propriedades de um [time](/api/routes/teams/README.md#team-structure) são atualizadas. Carga útil é o objeto do [time](/api/routes/teams/README.md#team-structure) atualizado.

#### Member Join

Enviado quando um usuário ingressa em um [time](/api/routes/teams/README.md#team-structure). Carga útil é o objeto do [membro](/api/routes/teams/README.md#team-member-structure) com `team_id` do time ingressado.

#### Member Leave

Enviado quando um usuário é expulso ou sai de um [time](/api/routes/teams/README.md#team-structure). Carga útil é o objeto do [membro](/api/routes/teams/README.md#team-member-structure) que saiu com `team_id` do ID do time.

#### Team Member Update

Enviado quando um [membro](/api/routes/teams/README.md#team-member-structure) é atualizado em um [time](/api/routes/teams/README.md#team-structure)

##### Team Member Update Fields

| FIELD          | TYPE      | DESCRIPTION                                                                         |
| -------------- | --------- | ----------------------------------------------------------------------------------- |
| member_id      | Snowflake | O ID do membro atualizado                                                           |
| new_permission | number    | A nova [permissão](/api/routes/teams/README.md#team-member-permissions) do membro   |
| old_permission | number    | A antiga [permissão](/api/routes/teams/README.md#team-member-permissions) do membro |
| team_id        | string    | O ID do time que o membro pertence                                                  |

#### Invite Code Update

Enviado quando o código de convite de um [time](/api/routes/teams/README.md#team-structure) é atualizado.

##### Invite Code Update Fields

| FIELD       | TYPE      | DESCRIPTION                                       |
| ----------- | --------- | ------------------------------------------------- |
| invite_code | string    | O novo código de convite                          |
| team_id     | string    | O ID que o código de convite pertence             |
| user_id     | Snowflake | O ID do usuário que atualizou o código de convite |

#### Audit-Log Entry Create

Enviado quando é criado uma [entrada](/api/routes/teams/README.md#audit-log-entry-structure) em um [time](/api/routes/teams/README.md#team-structure). Carga útil é um objeto de [entrada](/api/routes/teams/README.md#audit-log-entry-structure) com `team_id` do ID do time.

#### Bot Create

Enviado quando um [bot](/api/routes/bots/README.md#bot-structure) é criado. Carga útil é o objeto do [bot](/api/routes/bots/README.md#bot-structure) criado.

#### Bot Delete

Enviado quando um [bot](/api/routes/bots/README.md#bot-structure) é deletado. Carga útil é o objeto do [bot](/api/routes/bots/README.md#bot-structure) deletado.

#### Bot Update

Enviado quando as propriedades de um [bot](/api/routes/bots/README.md#bot-structure) são atualizadas. Carga útil é o objeto do [bot](/api/routes/bots/README.md#bot-structure) atualizado.

#### Feedback Delete

Enviado quando um [feedback](/api/routes/bots/README.md#feedback-structure) é deletado. Carga útil é o objeto do [feedback](/api/routes/bots/README.md#feedback-structure) deletado.

#### Feedback Update

Enviado quando as propriedades de um [feedback](/api/routes/bots/README.md#feedback-structure) são atualizadas. Carga útil é o objeto do [feedback](/api/routes/bots/README.md#feedback-structure) atualizado.

#### Vote Add

Enviado sempre que um usuário vota em um [bot](/api/routes/bots/README.md#bot-structure). Carga útil é o objeto do [voto](/api/routes/bots/README.md#vote-structure) com `bot_id` do ID do bot.

#### Feedback Add

Enviado sempre quando um usuário envia um [feedback](/api/routes/bots/README.md#feedback-structure) em um [bot](/api/routes/bots/README.md#bot-structure). Carga útil é o objeto do [feedback](/api/routes/bots/README.md#feedback-structure) criado.
