
const {token} = require('./config.json');
const {Client,GatewayIntentBits, Partials, Collection} = require('discord.js');

const fs = require('fs');
const path = require('path');

const client = new Client(
    {
        intents:
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ],
        partials:
        [
            Partials.Channel,
            Partials.Message,
            Partials.Reaction,
            Partials.GuildMember,
            Partials.User
        ]
    }
);
client.login(token);


const logs_channel_id = require('./config.json').channels.logs;

client.commands = new Collection();

const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v10');
const {Events} = require('discord.js');

const {join_listener,leave_listener} = require('./join_leave.js');

//#region commands

const deploy_commands = async () =>
{
    try
    {
        const commands = [];
        console.log('Deploying commands...');
        const command_files = fs.readdirSync(path.join(__dirname,'commands')).filter(file => file.endsWith('.js'));
        console.log(`Found ${command_files.length} command files.`);

        for(const file of command_files)
        {
            const command = require(`./commands/${file}`);
            console.log(`Processing command file ${file}...`);

            if('data' in command && 'execute' in command)
            {
                commands.push(command.data.toJSON());
                console.log(`Loaded command "${command.data.name}" from file ${file}.`);
            }
            else
                console.log(`[WARNING] The command at ./commands/${file} is missing a required "data" or "execute" property.`);
        }

        const rest = new REST({version: '10'}).setToken(token);

        console.log(`Started refreshing ${commands.length} application/commands globally.`);

        await rest.put(Routes.applicationCommands(client.user.id),{body: commands});

        console.log(`Successfully reloaded ${commands.length} application/commands globally.`);
    }
    catch(error)
    {
        console.error(`Error occurred while deploying commands: ${error}`);
    }
};

const commands_path = path.join(__dirname,'commands');
const command_files = fs.readdirSync(commands_path).filter(file => file.endsWith('.js'));

for(const file of command_files)
{
    const filePath = path.join(commands_path,file);
    const command = require(filePath);

    if('data' in command && 'execute' in command)
    {
        client.commands.set(command.data.name,command);
    }
    else
    {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate,async interaction =>
{
    if(!interaction.isChatInputCommand())
        return;
    
    const command = client.commands.get(interaction.commandName);

    if(!command)
    {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try
    {
        await command.execute(interaction);
    }
    catch(error)
    {
        console.error(`Error occurred while executing command "${interaction.commandName}": ${error}`);

        if(interaction.replied || interaction.deferred)
            await interaction.followUp({content: 'There was an error while executing this command!',ephemeral: true});
        else
            await interaction.reply({content: 'There was an error while executing this command!',ephemeral: true});
    }
});

//#endregion

client.once(Events.ClientReady,async () => {
    
    await deploy_commands();

    await join_listener(client);
    await leave_listener(client);
    
    console.log("Ready!");

    const logs_channel = await client.channels.fetch(logs_channel_id);
    //logs_channel?.send("Online!");
});