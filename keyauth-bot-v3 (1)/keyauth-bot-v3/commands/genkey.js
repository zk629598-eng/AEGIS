const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genkey')
    .setDescription('🔑 Generate license keys')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of keys (default 1)').setMinValue(1).setMaxValue(50)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const app = await pickApp(interaction);
    if (!app) return;

    const amount = interaction.options.getInteger('amount') || 1;

    // Button to open modal
    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('genkey_open_modal').setLabel('⚙️ Set Key Details').setStyle(ButtonStyle.Primary)
    );
    await interaction.editReply({ content: `✅ App: **${app.label}** — Amount: **${amount}**\nClick to set validity:`, components: [btn] });

    const btnCol = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.customId === 'genkey_open_modal' && i.user.id === interaction.user.id,
      time: 60000, max: 1,
    });

    btnCol.on('collect', async btnInt => {
      const modal = new ModalBuilder().setCustomId('genkey_modal').setTitle('🔑 Generate Keys');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('days').setLabel('Validity in days').setStyle(TextInputStyle.Short).setPlaceholder('e.g. 30').setRequired(true)
        )
      );
      await btnInt.showModal(modal);

      const submit = await btnInt.awaitModalSubmit({ time: 60000, filter: i => i.customId === 'genkey_modal' }).catch(() => null);
      if (!submit) return;
      await submit.deferUpdate().catch(() => {});

      const days = parseInt(submit.fields.getTextInputValue('days'));
      if (isNaN(days) || days < 1) return interaction.editReply({ content: '❌ Invalid days.', components: [] });

      const result = await keyauth.generateKey(app.ownerID, app.name, amount, days.toString());
      if (!result.success) return interaction.editReply({ content: `❌ Failed: ${result.message}`, components: [] });

      const keys = Array.isArray(result.keys) ? result.keys : [result.key];

      const embed = new EmbedBuilder()
        .setTitle('✅ Keys Generated')
        .setColor(0x57f287)
        .addFields(
          { name: '📦 App', value: app.label, inline: true },
          { name: '⏳ Validity', value: `${days} days`, inline: true },
          { name: '🔢 Count', value: `${keys.length}`, inline: true },
          { name: '🔑 Keys', value: keys.map(k => `\`${k}\``).join('\n').slice(0, 1024) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], components: [] });
    });
  },
};
