# Vote Status Resources

## Get user vote status

### GET `/api/vote-status/{user._id}`

#### Example Response Structure

```json
{
    "can_vote": false,
    "rest_time": 43196279
}
```

-   O ID do bot é baseado se você estiver usando JWT ou api-key. Caso use JWT, o
    ID do bot será o `userId`, caso api-key, o ID do bot sera o `_id` do bot que a api-key pertence
