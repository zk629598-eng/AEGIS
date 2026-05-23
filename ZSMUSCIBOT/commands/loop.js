const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle loop mode')
    .addStringOption(opt =>
      opt.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: '🔂 Current Song', value: 'song' },
          { name: '🔁 Whole Queue', value: 'queue' },
          { name: '❌ Disable Loop', value: 'off' },
        )
    ),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    const mode = interaction.options.getString('mode');

    if (mode === 'song') {
      queue.loop = true;
      queue.loopQueue = false;
      await interaction.reply({ embeds: [{ color: 0x1db954, title: '🔂 Loop: Current Song', description: 'The current song will repeat.' }] });
    } else if (mode === 'queue') {
      queue.loop = false;
      queue.loopQueue = true;
      await interaction.reply({ embeds: [{ color: 0x1db954, title: '🔁 Loop: Queue', description: 'The entire queue will repeat.' }] });
    } else {
      queue.loop = false;
      queue.loopQueue = false;
      await interaction.reply({ embeds: [{ color: 0xff4444, title: '❌ Loop Disabled', description: 'Loop mode turned off.' }] });
    }
  },
};
