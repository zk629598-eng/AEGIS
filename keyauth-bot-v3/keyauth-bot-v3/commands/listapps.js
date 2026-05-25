const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getApps } = require('../appstore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listapps')
    .setDescription('📋 List all KeyAuth apps added to this bot'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const apps = getApps();

    if (!apps.length) {
      return interaction.editReply({
        content: '📭 No apps added yet! Use `/addapp` to add your first KeyAuth app.',
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📦 KeyAuth Apps (${apps.length} total)`)
      .setColor(0x5865f2)
      .setDescription('Use `/removeapp` to remove any app.')
      .setTimestamp();

    apps.forEach((app, i) => {
      embed.addFields({
        name: `${i + 1}. ${app.label}`,
        value: [
          `📦 App Name: \`${app.name}\``,
          `🆔 Owner ID: \`${app.ownerID}\``,
          `🔢 Version: \`${app.version || '1.0'}\``,
        ].join('\n'),
      });
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
