const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder().setName('stats').setDescription('📊 View app stats dashboard'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const app = await pickApp(interaction);
    if (!app) return;

    await interaction.editReply({ content: '🔄 Fetching stats...', components: [] });
    const s = await keyauth.getDashboardSummary(app.ownerID, app.name);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Dashboard — ${app.label}`)
      .setColor(0x5865f2)
      .addFields(
        { name: '🔑 Total Keys', value: `${s.totalKeys}`, inline: true },
        { name: '✅ Used Keys', value: `${s.usedKeys}`, inline: true },
        { name: '🆓 Unused Keys', value: `${s.unusedKeys}`, inline: true },
        { name: '🚫 Banned Keys', value: `${s.bannedKeys}`, inline: true },
        { name: '👥 Total Users', value: `${s.totalUsers}`, inline: true },
        { name: '✅ Active Users', value: `${s.activeUsers}`, inline: true },
        { name: '🚫 Banned Users', value: `${s.bannedUsers}`, inline: true },
      )
      .setFooter({ text: `App: ${app.name}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });
  },
};
