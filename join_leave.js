
const join_channel_id = require('./config.json').channels.join;
const leave_channel_id = require('./config.json').channels.leave;

const join_listener = async (client) =>
{
    client.on('guildMemberAdd',async (member) => {
        const join_channel = await client.channels.fetch(join_channel_id);

        join_channel?.send(`Welcome, ${member}!`);
    });
}

const leave_listener = async (client) =>
{
    client.on('guildMemberRemove',async (member) => {
        const leave_channel = await client.channels.fetch(leave_channel_id);

        leave_channel?.send(`${member} has left the server.`);
    });
}

module.exports = {join_listener,leave_listener};