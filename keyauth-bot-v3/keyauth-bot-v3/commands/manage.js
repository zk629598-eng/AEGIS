const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('🔧 Manage users and keys')
    .addSubcommand(s => s.setName('banuser').setDescription('Ban a user').addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)))
    .addSubcommand(s => s.setName('unbanuser').setDescription('Unban a user').addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)))
    .addSubcommand(s => s.setName('deleteuser').setDescription('Delete a user').addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)))
    .addSubcommand(s => s.setName('resetuser').setDescription('Reset user HWID').addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)))
    .addSubcommand(s => s.setName('bankey').setDescription('Ban a key').addStringOption(o => o.setName('key').setDescription('License key').setRequired(true)))
    .addSubcommand(s => s.setName('unbankey').setDescription('Unban a key').addStringOption(o => o.setName('key').setDescription('License key').setRequired(true)))
    .addSubcommand(s => s.setName('deletekey').setDescription('Delete a key').addStringOption(o => o.setName('key').setDescription('License key').setRequired(true)))
    .addSubcommand(s => s.setName('verify').setDescription('Verify a license key').addStringOption(o => o.setName('key').setDescription('License key').setRequired(true))),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const app = await pickApp(interaction);
    if (!app) return;

    await interaction.editReply({ content: `✅ App: **${app.label}** — running action...`, components: [] });

    const sub = interaction.options.getSubcommand();
    let result, label;

    if (sub === 'banuser') { const u = interaction.options.getString('username'); result = await keyauth.banUser(app.ownerID, app.name, u); label = `🚫 Banned user \`${u}\``; }
    else if (sub === 'unbanuser') { const u = interaction.options.getString('username'); result = await keyauth.unbanUser(app.ownerID, app.name, u); label = `✅ Unbanned user \`${u}\``; }
    else if (sub === 'deleteuser') { const u = interaction.options.getString('username'); result = await keyauth.deleteUser(app.ownerID, app.name, u); label = `🗑️ Deleted user \`${u}\``; }
    else if (sub === 'resetuser') { const u = interaction.options.getString('username'); result = await keyauth.resetUser(app.ownerID, app.name, u); label = `🔄 Reset HWID for \`${u}\``; }
    else if (sub === 'bankey') { const k = interaction.options.getString('key'); result = await keyauth.banKey(app.ownerID, app.name, k); label = `🚫 Banned key \`${k}\``; }
    else if (sub === 'unbankey') { const k = interaction.options.getString('key'); result = await keyauth.unbanKey(app.ownerID, app.name, k); label = `✅ Unbanned key \`${k}\``; }
    else if (sub === 'deletekey') { const k = interaction.options.getString('key'); result = await keyauth.deleteKey(app.ownerID, app.name, k); label = `🗑️ Deleted key \`${k}\``; }
    else if (sub === 'verify') { const k = interaction.options.getString('key'); result = await keyauth.verifyKey(app.ownerID, app.name, k); label = `🔍 Verified key \`${k}\``; }

    const embed = new EmbedBuilder()
      .setTitle(result?.success ? '✅ Success' : '❌ Failed')
      .setColor(result?.success ? 0x57f287 : 0xed4245)
      .addFields(
        { name: 'Action', value: label, inline: false },
        { name: 'App', value: app.label, inline: true },
        { name: 'Message', value: result?.message || 'Unknown', inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });
  },
};
