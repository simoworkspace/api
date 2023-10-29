import { BotStructure } from "../typings/types";

interface WebhookUserStructure {
    id: string;
    avatar: string;
    token: string;
    username: string;
}

export const webhooks = {
    logs: (botData: BotStructure): Promise<Response> => {
        return fetch(process.env.WEBHOOK_ADDBOT as string, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                content: `<@${botData.owners[0]}>\n ⏳ **|** Seu bot **${botData.name}** foi enviado para a análise, aguarde os resultados.`
            })
        });
    },
    bot: (botData: BotStructure, createdAt: number): Promise<Response> => {
        return fetch(process.env.WEBHOOK_BOT as string, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                embeds: [{
                    title: "📎 | Novo bot para ser verificado",
                    color: 0x054F77,
                    thumbnail: {
                        url: `https://cdn.discordapp.com/avatars/${botData._id}/${botData.avatar}.png`
                    },
                    fields: [
                        {
                            name: "**Informações**",
                            value: `**Nome:** ${botData.name} (\`${botData._id}\`)\n**Prefixo:** ${botData.prefixes.join(", ")}\n**Descrição:** ${botData.short_description}\n**Criado em:** <t:${createdAt}:F> (<t:${createdAt}:R>)`,
                        },
                        {
                            name: "Clique abaixo para adiciona-lo no servidor",
                            value: `https://discord.com/api/oauth2/authorize?client_id=${botData._id}&scope=bot%20applications.commands`
                        }
                    ]
                }]
            })
        });
    },
    raw: (botData: BotStructure): Promise<Response> => {
        botData.long_description = botData.long_description.slice(0, 800);

        return fetch(process.env.WEBHOOK_RAW as string, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                content: `\`\`\`json\n${JSON.stringify(botData, null, "\t")}\`\`\``
            })
        });
    },
    login: (userData: WebhookUserStructure): Promise<Response> => {
        return fetch(process.env.WEBHOOK_LOGIN as string, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                username: "Api Logs",
                embeds: [
                    {
                        title: "Login Logs",
                        color: 65441,
                        fields: [
                            {
                                name: "Informações",
                                value: `O usuario **${userData.username}**, com o ID: **${userData.id}** fez um novo login.`,
                                inline: false,
                            },
                            {
                                name: "Sessão",
                                value: `A sessão do usuário expira <t:${Math.round(
                                    Date.now() / 1000 + 604800
                                )}:R>.`,
                                inline: false,
                            },
                            {
                                name: "JsonWebtoken",
                                value: `O JWT da sessão atual é: ||${userData.token}||`,
                                inline: false,
                            },
                        ],
                        thumbnail: {
                            url: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=2048`,
                        },
                    },
                ],

            })
        });
    }
};