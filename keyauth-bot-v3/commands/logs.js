const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('📋 View activity logs for an app'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const app = await pickApp(interaction);
    if (!app) return;

    await interaction.editReply({ content: '🔄 Fetching logs...', components: [] });
    const result = await keyauth.fetchLogs(app.ownerID, app.name);
    if (!result.success) return interaction.editReply({ content: `❌ ${result.message}` });

    const logs = (result.logs || []).slice(0, 15);
    if (!logs.length) return interaction.editReply({ content: '📭 No logs found.' });

    const embed = new EmbedBuilder()
      .setTitle(`📋 Logs — ${app.label}`)
      .setColor(0xfee75c)
      .setDescription(logs.map(l => `\`${l.time || 'N/A'}\` **${l.username || '?'}** — ${l.action || l.message || 'N/A'}`).join('\n'))
      .setFooter({ text: `Showing ${logs.length} recent logs` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });
  },
};
