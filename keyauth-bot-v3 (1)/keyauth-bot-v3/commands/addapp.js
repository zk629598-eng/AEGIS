const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');
const { addApp } = require('../appstore');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addapp')
    .setDescription('➕ Add a KeyAuth app to the bot'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('addapp_modal')
      .setTitle('➕ Add KeyAuth App');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_label')
          .setLabel('App Label (nickname for this bot)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. ZS Cheat')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_name')
          .setLabel('App Name (exact name in KeyAuth)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. ZS')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('owner_id')
          .setLabel('Owner ID')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. inlBe174bk')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('secret_key')
          .setLabel('Secret Key')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. e07890295382...')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_version')
          .setLabel('App Version')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. 1.0')
          .setRequired(true)
      )
    );

    await interaction.showModal(modal);

    const submit = await interaction.awaitModalSubmit({
      time: 120000,
      filter: i => i.customId === 'addapp_modal' && i.user.id === interaction.user.id,
    }).catch(() => null);

    if (!submit) return;

    await submit.deferReply({ ephemeral: true });

    const label = submit.fields.getTextInputValue('app_label').trim();
    const appName = submit.fields.getTextInputValue('app_name').trim();
    const ownerID = submit.fields.getTextInputValue('owner_id').trim();
    const secretKey = submit.fields.getTextInputValue('secret_key').trim();
    const version = submit.fields.getTextInputValue('app_version').trim();

    // Test credentials
    await submit.editReply({ content: '🔄 Testing credentials...' });
    const test = await keyauth.testCredentials(ownerID, appName);

    if (!test.success && test.message?.toLowerCase().includes('invalid')) {
      return submit.editReply({
        content: `❌ Invalid credentials! KeyAuth says: \`${test.message}\`\nPlease double-check your Owner ID, App Name, and Secret Key.`,
      });
    }

    // Save app
    addApp({ label, name: appName, ownerID, secretKey, version });

    const embed = new EmbedBuilder()
      .setTitle('✅ App Added Successfully!')
      .setColor(0x57f287)
      .addFields(
        { name: '🏷️ Label', value: label, inline: true },
        { name: '📦 App Name', value: appName, inline: true },
        { name: '🔢 Version', value: version, inline: true },
        { name: '🆔 Owner ID', value: `\`${ownerID}\``, inline: false },
      )
      .setFooter({ text: 'Use /listapps to see all apps' })
      .setTimestamp();

    await submit.editReply({ embeds: [embed] });
  },
};
