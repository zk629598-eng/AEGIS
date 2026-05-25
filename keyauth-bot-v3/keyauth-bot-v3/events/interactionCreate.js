const { Events, EmbedBuilder } = require('discord.js');
const keyauth = require('../keyauth');
const panelCommand = require('../commands/panel');

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

    // ─── Panel Get Key Button ─────────────────────────────────
    if (interaction.isButton() && interaction.customId === 'panel_get_key') {
      await interaction.deferReply({ ephemeral: true });

      const config = panelCommand.getPanelConfig(interaction.guildId);
      if (!config) {
        return interaction.editReply({ content: '❌ No active panel. An admin must run `/panel` first.' });
      }

      const { days, app } = config;
      const result = await keyauth.generateKey(app.ownerID, app.name, 1, days.toString());

      if (!result.success) {
        return interaction.editReply({ content: `❌ Failed to generate key: ${result.message}` });
      }

      const key = Array.isArray(result.keys) ? result.keys[0] : result.key;

      const dmEmbed = new EmbedBuilder()
        .setTitle('🎉 Your License Key')
        .setColor(0x57f287)
        .addFields(
          { name: '🔑 Key', value: `\`\`\`${key}\`\`\`` },
          { name: '📦 App', value: app.label, inline: true },
          { name: '⏳ Valid For', value: `${days} day${days !== 1 ? 's' : ''}`, inline: true },
        )
        .setDescription('> ⚠️ Keep this key safe! Do not share it with anyone.')
        .setTimestamp()
        .setFooter({ text: 'KeyAuth License' });

      try {
        await interaction.user.send({ embeds: [dmEmbed] });
        await interaction.editReply({ content: '✅ Your key has been sent to your DMs! 📬' });
      } catch {
        await interaction.editReply({
          content: '⚠️ Could not DM you (DMs may be closed). Here is your key:',
          embeds: [dmEmbed],
        });
      }
    }
  },
};
