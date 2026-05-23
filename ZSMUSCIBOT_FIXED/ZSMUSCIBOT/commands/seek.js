const { SlashCommandBuilder } = require('discord.js');
const { createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a specific timestamp in the current song')
    .addStringOption(opt =>
      opt.setName('time')
        .setDescription('Timestamp to seek to (e.g. 1:30 or 90 for 90 seconds)')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const queue = client.queues.get(interaction.guild.id);
    if (!queue || !queue.currentSong) {
      return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
    }

    const timeStr = interaction.options.getString('time');
    let seconds = 0;

    if (timeStr.includes(':')) {
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
      else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      seconds = parseInt(timeStr, 10);
    }

    if (isNaN(seconds) || seconds < 0) {
      return interaction.reply({ content: '❌ Invalid time format. Use `1:30` or `90`.', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const stream = ytdl(queue.currentSong.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        begin: seconds * 1000,
      });

      const resource = createAudioResource(stream, { inlineVolume: true });
      resource.volume.setVolume(queue.volume);
      queue.player.play(resource);

      const formatted = seconds >= 3600
        ? `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
        : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

      await interaction.editReply({
        embeds: [{
          color: 0x5865f2,
          title: '⏩ Seeked',
          description: `Jumped to **${formatted}** in **${queue.currentSong.title}**`,
        }],
      });
    } catch (err) {
      await interaction.editReply(`❌ Could not seek: ${err.message}`);
    }
  },
};
