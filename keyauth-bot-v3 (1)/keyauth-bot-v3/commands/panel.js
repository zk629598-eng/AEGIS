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

// Store panel config per guild
const panelConfig = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('🎛️ Create a public key/user distribution panel'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const app = await pickApp(interaction);
    if (!app) return;

    // Step 1: Choose mode - license key or user+pass
    const modeSelect = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('panel_mode_select')
        .setPlaceholder('Select what to give users')
        .addOptions([
          {
            label: '🔑 License Key',
            description: 'Auto-generate a license key and DM it to user',
            value: 'key',
          },
          {
            label: '👤 Username + Password',
            description: 'Auto-create a user account and DM credentials',
            value: 'user',
          },
        ])
    );

    await interaction.editReply({
      content: `✅ App: **${app.label}**\n\n**What should users receive when they click Get Access?**`,
      components: [modeSelect],
    });

    const modeCol = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.customId === 'panel_mode_select' && i.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    modeCol.on('collect', async modeInt => {
      const mode = modeInt.values[0]; // 'key' or 'user'

      // Step 2: Button to open config modal
      const configBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('panel_open_modal')
          .setLabel('⚙️ Configure Panel')
          .setStyle(ButtonStyle.Primary)
      );

      await modeInt.update({
        content: `✅ App: **${app.label}** • Mode: **${mode === 'key' ? '🔑 License Key' : '👤 User + Password'}**\n\nClick to set panel options:`,
        components: [configBtn],
      });

      const btnCol = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => i.customId === 'panel_open_modal' && i.user.id === interaction.user.id,
        time: 60000,
        max: 1,
      });

      btnCol.on('collect', async btnInt => {
        const modal = new ModalBuilder()
          .setCustomId('panel_modal')
          .setTitle('⚙️ Panel Setup');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('panel_days')
              .setLabel('Validity in days')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('e.g. 30')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('panel_title')
              .setLabel('Panel title (optional)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('e.g. 🎉 Free Access Giveaway')
              .setRequired(false)
          )
        );

        await btnInt.showModal(modal);

        const submit = await btnInt.awaitModalSubmit({
          time: 120000,
          filter: i => i.customId === 'panel_modal',
        }).catch(() => null);

        if (!submit) return interaction.editReply({ content: '⏰ Timed out.', components: [] });

        const days = parseInt(submit.fields.getTextInputValue('panel_days'));
        const title = submit.fields.getTextInputValue('panel_title') ||
          (mode === 'key' ? '🔑 Get Your License Key' : '👤 Get Your Account');

        if (isNaN(days) || days < 1) {
          return submit.reply({ content: '❌ Invalid days.', ephemeral: true });
        }

        // Save config
        panelConfig[interaction.guildId] = { days, app, mode };

        await submit.deferUpdate().catch(() => {});

        // Build public panel embed
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setColor(mode === 'key' ? 0x5865f2 : 0xfee75c)
          .setDescription(
            `> Click the button below to receive your access!\n\n` +
            `📦 **App:** ${app.label}\n` +
            `⏳ **Valid for:** ${days} day${days !== 1 ? 's' : ''}\n` +
            `📬 **Delivery:** ${mode === 'key' ? 'License key sent to your DMs' : 'Username & password sent to your DMs'}\n\n` +
            `⚠️ Make sure your DMs are open!`
          )
          .setFooter({ text: `${app.label} • ${days} days • ${mode === 'key' ? 'License Key' : 'User Account'}` })
          .setTimestamp();

        const getBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('panel_get_key')
            .setLabel(mode === 'key' ? '🔑 Get Key' : '👤 Get Account')
            .setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({
          content: `✅ Panel created! (${mode === 'key' ? 'License Key' : 'User+Pass'} • ${days} days)`,
          components: [],
        });
        await interaction.channel.send({ embeds: [embed], components: [getBtn] });
      });
    });
  },

  getPanelConfig(guildId) {
    return panelConfig[guildId];
  },
};
