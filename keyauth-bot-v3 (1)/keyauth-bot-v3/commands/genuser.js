const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genuser')
    .setDescription('👤 Create a user account (username + password)'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const app = await pickApp(interaction);
    if (!app) return;

    // Button to open modal
    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('genuser_open_modal')
        .setLabel('👤 Set User Details')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: `✅ App: **${app.label}**\nClick below to fill in user details:`,
      components: [btn],
    });

    const btnCol = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.customId === 'genuser_open_modal' && i.user.id === interaction.user.id,
      time: 60000,
      max: 1,
    });

    btnCol.on('collect', async btnInt => {
      const modal = new ModalBuilder()
        .setCustomId('genuser_modal')
        .setTitle('👤 Create User Account');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('username')
            .setLabel('Username')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. john123')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('password')
            .setLabel('Password')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. SecurePass123')
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('days')
            .setLabel('Validity in days')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 30')
            .setRequired(true)
        )
      );

      await btnInt.showModal(modal);

      const submit = await btnInt.awaitModalSubmit({
        time: 120000,
        filter: i => i.customId === 'genuser_modal',
      }).catch(() => null);

      if (!submit) return;
      await submit.deferUpdate().catch(() => {});

      const username = submit.fields.getTextInputValue('username').trim();
      const password = submit.fields.getTextInputValue('password').trim();
      const days = parseInt(submit.fields.getTextInputValue('days'));

      if (isNaN(days) || days < 1) {
        return interaction.editReply({ content: '❌ Invalid days value.', components: [] });
      }

      const result = await keyauth.createUser(app.ownerID, app.name, username, password, days.toString());

      if (!result.success) {
        return interaction.editReply({
          content: `❌ Failed to create user: \`${result.message}\``,
          components: [],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ User Account Created')
        .setColor(0x57f287)
        .addFields(
          { name: '📦 App', value: app.label, inline: true },
          { name: '⏳ Valid For', value: `${days} days`, inline: true },
          { name: '👤 Username', value: `\`\`\`${username}\`\`\`` },
          { name: '🔑 Password', value: `\`\`\`${password}\`\`\`` },
        )
        .setDescription('> ⚠️ Share these credentials safely. Do not post in public channels.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], components: [] });
    });
  },
};
