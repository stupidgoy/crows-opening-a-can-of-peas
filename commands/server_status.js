const {SlashCommandBuilder} = require('discord.js');

async function getServer(address)
{
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${address}`);
    if(!res.ok)
        throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    
    return {online: `${json.online}`, players: `${json.players.online}/${json.players.max}`, motd: `${json.motd.clean}`};
}


module.exports =
{
    data: new SlashCommandBuilder()
    .setName('server_status')
    .addStringOption(option => option.setName('address').setDescription('The address of the server to check!').setRequired(true))
    .setDescription('Gets the status of a Minecraft server!'),
    async execute(interaction)
    {
        await getServer(interaction.options.getString('address'))
        .then(res => interaction.reply('online: ' + res.online + '\nplayers: ' + res.players + '\nmotd: ' + res.motd)).catch(err => console.error(err));
    }
}
