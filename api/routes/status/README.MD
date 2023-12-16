# API Resources

## API Status Structure

| KEY           | TYPE   | DESCRIPTION                                                       |
| ------------- | ------ | ----------------------------------------------------------------- |
| total_mem     | number | A memória RAM total da API                                        |
| free_mem      | number | A memória RAM livre da API                                        |
| users         | number | O número total de usuários logados na API                         |
| bots          | number | O número total bots adicionados na API                            |
| uptime        | number | O uptime da API                                                   |
| request_count | number | O número total de requisições feitas desde que a API ficou online |

### Example Response

```json
{
    "total_mem": 8183.109375,
    "free_mem": 2253.48046875,
    "users": 7,
    "bots": 9,
    "uptime": 5591,
    "request_count": 4
}
```

## Get API status

### GET `/api/status`

Este método é usado para retornar os status da API, retorna um objeto de [api status](#api-status-structure)
