const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

const panelConfig = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('🎛️ Create a public key distribution panel'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const app = await pickApp(interaction);
    if (!app) return;

    // Ask for days and title
    const modal = new ModalBuilder().setCustomId('panel_modal').setTitle('⚙️ Panel Setup');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('panel_days')
          .setLabel('Key validity in days')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. 30')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('panel_title')
          .setLabel('Panel title (shown on embed)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. 🎉 Free Key Giveaway')
          .setRequired(false)
      )
    );

    // We need a follow-up modal since we deferred
    await interaction.followUp({ content: '📋 Opening panel setup...', ephemeral: true });

    // Re-prompt with a button to open modal
    const openBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('panel_open_modal')
        .setLabel('⚙️ Configure Panel')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({ content: `✅ App selected: **${app.label}**\nClick below to set panel options:`, components: [openBtn] });

    const btnCol = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.customId === 'panel_open_modal' && i.user.id === interaction.user.id,
      time: 60000, max: 1,
    });

    btnCol.on('collect', async btnInt => {
      await btnInt.showModal(modal);

      const submit = await btnInt.awaitModalSubmit({
        time: 120000,
        filter: i => i.customId === 'panel_modal',
      }).catch(() => null);

      if (!submit) return interaction.editReply({ content: '⏰ Timed out.', components: [] });

      const days = parseInt(submit.fields.getTextInputValue('panel_days'));
      const title = submit.fields.getTextInputValue('panel_title') || '🔑 Get Your License Key';

      if (isNaN(days) || days < 1) {
        return submit.reply({ content: '❌ Invalid days.', ephemeral: true });
      }

      panelConfig[interaction.guildId] = { days, app };

      await submit.deferUpdate().catch(() => {});

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(
          `> Click **🔑 Get Key** to receive your license key!\n\n` +
          `📦 **App:** ${app.label}\n` +
          `⏳ **Valid for:** ${days} day${days !== 1 ? 's' : ''}\n\n` +
          `⚠️ Make sure your DMs are open!`
        )
        .setColor(0x5865f2)
        .setFooter({ text: `${app.label} • ${days} days` })
        .setTimestamp();

      const getKeyBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('panel_get_key')
          .setLabel('🔑 Get Key')
          .setStyle(ButtonStyle.Success)
      );

      await interaction.editReply({ content: `✅ Panel created for **${app.label}** (${days} days)!`, components: [] });
      await interaction.channel.send({ embeds: [embed], components: [getKeyBtn] });
    });
  },

  getPanelConfig(guildId) {
    return panelConfig[guildId];
  },
};
