const { Events, EmbedBuilder } = require('discord.js');
const keyauth = require('../keyauth');
const panelCommand = require('../commands/panel');

// Simple random password generator for user+pass panel
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

// Simple username from Discord tag
function generateUsername(discordUser) {
  const clean = discordUser.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${clean}${rand}`;
}

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    // ─── Slash Commands ───────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`Error in /${interaction.commandName}:`, err);
        const msg = { content: '❌ An error occurred.', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
        else await interaction.reply(msg);
      }
      return;
    }

    // ─── Panel Button ─────────────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'panel_get_key') {
      await interaction.deferReply({ ephemeral: true });

      const config = panelCommand.getPanelConfig(interaction.guildId);
      if (!config) {
        return interaction.editReply({ content: '❌ No active panel. An admin must run `/panel` first.' });
      }

      const { days, app, mode } = config;

      // ── Mode: License Key ──────────────────────────────────
      if (mode === 'key') {
        const result = await keyauth.generateKey(app.ownerID, app.name, 1, days.toString());

        if (!result.success) {
          return interaction.editReply({ content: `❌ Failed to generate key: ${result.message}` });
        }

        const key = Array.isArray(result.keys) ? result.keys[0] : result.key;

        const dmEmbed = new EmbedBuilder()
          .setTitle('🎉 Your License Key')
          .setColor(0x5865f2)
          .addFields(
            { name: '🔑 License Key', value: `\`\`\`${key}\`\`\`` },
            { name: '📦 App', value: app.label, inline: true },
            { name: '⏳ Valid For', value: `${days} day${days !== 1 ? 's' : ''}`, inline: true },
          )
          .setDescription('> ⚠️ Keep this key safe! Do not share it with anyone.')
          .setTimestamp()
          .setFooter({ text: 'KeyAuth License' });

        try {
          await interaction.user.send({ embeds: [dmEmbed] });
          await interaction.editReply({ content: '✅ Your license key has been sent to your DMs! 📬' });
        } catch {
          await interaction.editReply({
            content: '⚠️ Could not DM you (DMs may be closed). Here is your key:',
            embeds: [dmEmbed],
          });
        }
      }

      // ── Mode: Username + Password ──────────────────────────
      else if (mode === 'user') {
        const username = generateUsername(interaction.user);
        const password = generatePassword(12);

        const result = await keyauth.createUser(app.ownerID, app.name, username, password, days.toString());

        if (!result.success) {
          return interaction.editReply({ content: `❌ Failed to create account: ${result.message}` });
        }

        const dmEmbed = new EmbedBuilder()
          .setTitle('🎉 Your Account Credentials')
          .setColor(0xfee75c)
          .addFields(
            { name: '👤 Username', value: `\`\`\`${username}\`\`\`` },
            { name: '🔑 Password', value: `\`\`\`${password}\`\`\`` },
            { name: '📦 App', value: app.label, inline: true },
            { name: '⏳ Valid For', value: `${days} day${days !== 1 ? 's' : ''}`, inline: true },
          )
          .setDescription('> ⚠️ Keep these credentials safe! Do not share them with anyone.')
          .setTimestamp()
          .setFooter({ text: 'KeyAuth Account' });

        try {
          await interaction.user.send({ embeds: [dmEmbed] });
          await interaction.editReply({ content: '✅ Your account credentials have been sent to your DMs! 📬' });
        } catch {
          await interaction.editReply({
            content: '⚠️ Could not DM you (DMs may be closed). Here are your credentials:',
            embeds: [dmEmbed],
          });
        }
      }
    }
  },
};
