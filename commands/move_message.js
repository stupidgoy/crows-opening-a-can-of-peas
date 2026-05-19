const {SlashCommandBuilder} = require('discord.js');


module.exports =
{    data: new SlashCommandBuilder()
    .setName('move_message')
    .addStringOption(option => option.setName('message_id').setDescription('The ID of the message to move!').setRequired(true))
    .addChannelOption(option => option.setName('channel').setDescription('The channel to move the message to!').setRequired(true))
    .setDescription('Moves a message to another channel!'),
    async execute(interaction)
    {
        const message_id = interaction.options.getString('message_id');
        const channel = interaction.options.getChannel('channel');
        const message = await interaction.channel.messages.fetch(message_id).catch(err => console.error(err));

        if(!message)
        {
            await interaction.reply({content: 'Could not find a message with that ID in this channel!',ephemeral: true});
            return;
        }

        const new_message = `Moving this to ${channel} \n\n Original sender: ${message.author} \n\n \"${message.content}\"`;
        await channel.send(new_message);
        await message.delete();

        await interaction.reply({content: 'Message moved to ' + channel.name + '!',ephemeral: true});
    }
}