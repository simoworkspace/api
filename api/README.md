# API

Simo API é uma API baseada em HTTP/REST para serviços em geral. Geralmente usada
no front-end com alguma biblioteca wrapper

## Autenticação

A autenticação pode ser feita de duas maneiras:

-   1\. Usando Json Web Token (método menos comum, geralmente usada no front-end)
-   2\. Usando uma api-key gerada no site [Simo botlist](https://bombadeagua.life)

Todas as autenticações devem ser colocada no cabeçalho `Authorization` em uma
requisição HTTP.

-   Caso use Json Web Token, use o prefixo `User` antes do Json Web Token
-   Caso use api-key, use o prefixo `Bot` antes da api-key

### Exemplo

-   Usando api-key

```json
{
    "Authorization": "Bot 0jija6272bfda-e4jb2bj6bje5c-2icdeg51ee0jb"
}
```

-   Usando Json Web Token

```json
{
    "Authorization": "User eyJhbGciOiJIUzI1NiJ9.UG9yIHF1ZSB2b2PDqiB0ZW50b3UgZGVjb2RpZmljYXIgaXNzbz8.cXaza7vgMrvJR0MXihfaSh7eJUXzsFdmK-b4c_8dEZg"
}
```

## Tipos

Comos os tipos são documentados? Os tipos seguem o padrão do TypeScript. Alguns
campos podem ser conter o valor `null` e alguns campos podem ser opicionais

### Exemplos De Campos anuláveis e opcionais

| NAME         | TYPE    |
| ------------ | ------- |
| anulável     | ?string |
| opcional?    | string  |
| campo_normal | string  |

## Datas

Sempre quando necessário salvar a data de criação/atualização de algo, é utilizado
datas `ISO8601`

## Erros

Erros talvez possam ter a propriedade `errors` e alguns não. Erros são feitos para
ser legível por humanos. Em quase cada nova atualização um erro é adicionado (você
pode ver eles em [errors](/api/utils/errors.json)). Exemplo de erros:

Erro normal:

```json
{
    "message": "Unknown user",
    "code": 5001
}
```

Erros com `errors`:

```json
{
    "errors": [
        "vote_message must be a `string` type, but the final value was: `2`."
    ]
}
```

## Livrarias

Você pode interagir de formas diferentes ao invés de usar a API cruamente. Usando
api wrappers fica mais fácil de se interagir com a verdadeira API.

### `@simo.js/rest`

Com `@simo.js/rest` você pode criar e interagir com Simo API de uma maneira melhor.

Pegando o usuário atual:

```js
const { REST, Routes } = require("@simo.js/rest");

const rest = new REST({ auth: "API-AUTH" });

const userData = await rest.get(Routes.getUser("@me"));

console.log("Nome do usuário:", userData.username);
```

### `@simo.js/simo.js`

Uma poderosa livraria que deixa você interagir com qualquer routa e maneira da
Simo API

Criando um bot:

```js
const { API } = require("@simo.js/simo.js");

const client = new API({
    auth: "API-AUTH",
});

await client.bots.create({
    inviteURL: "convite-do-bot",
    shortSescription: "Alguma descrição curta vai aqui",
    longDescription: "Alguma descrição looooonga vai aqui...",
    prefixes: ["!"],
    tags: ["economia"],
});
```
