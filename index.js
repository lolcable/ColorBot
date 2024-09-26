require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder, Role, Colors} = require('discord.js');
const console = require("console");
const client = new Client({intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent]});
let prefixSignature = 'cr_';
let suffixSignature = '';

client.on("ready", (x) => {
    console.log('${x.user.tag} is ready!');
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = String (now.getSeconds()).padStart(2, '0');
    client.user.setActivity(("Compiled At: " + hours + ":" + minutes + ":" + seconds).toString());
    console.log("testtt");

    const colorRoleRGB = new SlashCommandBuilder()
        .setName('color_role')
        .setDescription('Create a Color Role from RGB values!')
        .addIntegerOption(option =>
            option.setName('red')
                .setDescription('R Value of Color')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('green')
                .setDescription('G Value of Color')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('blue')
                .setDescription('B Value of Color')
                .setMinValue(0)
                .setMaxValue(255)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role_name')
                .setDescription('Name of the Role')
                .setRequired(false));
    client.application.commands.create(colorRoleRGB);

    /*const setSignature = new SlashCommandBuilder()
        .setName('set_signature')
        .setDescription('Set the Prefix and/or Suffix for Color Roles!')
        .addStringOption(option =>
            option.setName('prefix')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('suffix')
                .setRequired(false));
    client.application.commands.create(setSignature);*/
});

client.on('interactionCreate', interaction => {
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName==='color_role'){
        const color = rgbToHex(
            interaction.options.get('red', true).value,
            interaction.options.get('green', true).value,
            interaction.options.get('blue', true).value);
        let roleName = interaction.options.get('role_name')?.value || color.toString();
        interaction.guild.roles.create({
            name: prefixSignature + roleName + suffixSignature,
            color: color,
            reason: 'Color Role',
        }).then(role => {
            removeColorRolesFromMember(interaction.member);
            interaction.member.roles.add(role).then(gm => colorRoleGarbageCollector(interaction, role))})
            .catch(console.error);

        interaction.reply('Role Added');
    }

});

function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function removeColorRolesFromMember(member){
    member.roles.cache.forEach(role => {
        if (role.name.startsWith(prefixSignature) && role.name.endsWith(suffixSignature)){
            console.log("Cleared " + role.name + "from member");
            member.roles.remove(role);
        }
    });
}

async function colorRoleGarbageCollector(interaction, ignore){
    interaction.guild.roles.fetch().then(roles =>
    roles.forEach(role => {
        if (role.name.startsWith(prefixSignature) && role.name.endsWith(suffixSignature)){
            if (role.members.size === 0 && role.id !== ignore.id){
                role.delete().catch(console.error);
                console.log(role.name + ": Deleted Role with no members");
            }else {
                console.log(role.name + " " + role.members.size);
            }
        }
    }));
}

client.login(process.env.TOKEN);