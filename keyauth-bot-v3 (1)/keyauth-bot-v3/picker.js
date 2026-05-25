const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const { getApps } = require('./appstore');

/**
 * Shows app selector and resolves with selected app object.
 * Returns null if no apps, timed out, or error.
 */
async function pickApp(interaction) {
  const apps = getApps();

  if (!apps.length) {
    await interaction.editReply({
      content: '📭 No apps added yet! Use `/addapp` to add a KeyAuth app first.',
    });
    return null;
  }

  // If only one app, auto-select it
  if (apps.length === 1) return apps[0];

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('pick_app_select')
      .setPlaceholder('📦 Select app')
      .addOptions(apps.map(a => ({
        label: a.label,
        description: `App: ${a.name}`,
        value: a.name,
      })))
  );

  await interaction.editReply({ content: '📦 Select which app:', components: [selectRow] });

  const selected = await new Promise(resolve => {
    const col = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.customId === 'pick_app_select' && i.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    col.on('collect', async i => {
      await i.deferUpdate();
      resolve(apps.find(a => a.name === i.values[0]));
    });

    col.on('end', (collected, reason) => {
      if (reason === 'time') resolve(null);
    });
  });

  if (!selected) {
    await interaction.editReply({ content: '⏰ Timed out.', components: [] });
    return null;
  }

  return selected;
}

module.exports = { pickApp };
