const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { getApps, removeApp } = require('../appstore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeapp')
    .setDescription('🗑️ Remove a KeyAuth app from the bot'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const apps = getApps();
    if (!apps.length) {
      return interaction.editReply({ content: '📭 No apps to remove.' });
    }

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('removeapp_select')
        .setPlaceholder('Select app to remove')
        .addOptions(apps.map(a => ({
          label: a.label,
          description: `App: ${a.name} • Owner: ${a.ownerID}`,
          value: a.name,
        })))
    );

    await interaction.editReply({
      content: '🗑️ Select which app to remove:',
      components: [selectRow],
    });

    const col = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.customId === 'removeapp_select' && i.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    col.on('collect', async selectInt => {
      const appName = selectInt.values[0];
      const app = apps.find(a => a.name === appName);

      // Confirm button
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('removeapp_confirm')
          .setLabel(`Yes, remove "${app.label}"`)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('removeapp_cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

      await selectInt.update({
        content: `⚠️ Are you sure you want to remove **${app.label}** (\`${app.name}\`)?`,
        components: [confirmRow],
      });

      const btnCol = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => ['removeapp_confirm', 'removeapp_cancel'].includes(i.customId) && i.user.id === interaction.user.id,
        time: 30000,
        max: 1,
      });

      btnCol.on('collect', async btnInt => {
        if (btnInt.customId === 'removeapp_cancel') {
          return btnInt.update({ content: '❌ Cancelled.', components: [] });
        }

        removeApp(appName);

        const embed = new EmbedBuilder()
          .setTitle('🗑️ App Removed')
          .setColor(0xed4245)
          .addFields(
            { name: '🏷️ Label', value: app.label, inline: true },
            { name: '📦 App Name', value: app.name, inline: true },
          )
          .setTimestamp();

        await btnInt.update({ embeds: [embed], components: [], content: '' });
      });
    });
  },
};
