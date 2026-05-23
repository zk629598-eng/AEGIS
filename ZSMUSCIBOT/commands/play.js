const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { createQueue, playSong } = require('../utils/queueManager');
const { resolveSong } = require('../utils/youtube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube (URL or search query)')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('YouTube URL or song name to search')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });
    }

    await interaction.deferReply();

    const query = interaction.options.getString('query');

    let song;
    try {
      song = await resolveSong(query);
      song.requestedBy = interaction.user.username;
    } catch (err) {
      return interaction.editReply(`❌ Could not find: **${query}**\n\`${err.message}\``);
    }

    let queue = client.queues.get(interaction.guild.id);

    if (!queue || !queue.connection) {
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false,
        });

        try {
          await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        } catch (e) {
          // continue anyway
        }

        queue = createQueue(interaction.guild.id, connection, interaction.channel);
        client.queues.set(interaction.guild.id, queue);
      } catch (err) {
        console.error('Voice join error:', err);
        return interaction.editReply('❌ Could not join your voice channel. Make sure I have **Connect** and **Speak** permissions!');
      }
    }

    queue.textChannel = interaction.channel;

    if (!queue.playing || !queue.currentSong) {
      await interaction.editReply({
        embeds: [{
          color: 0x1db954,
          title: '🎶 Loading...',
          description: `Fetching **${song.title}**...`,
        }],
      });
      playSong(queue, song);
    } else {
      queue.songs.push(song);
      await interaction.editReply({
        embeds: [{
          color: 0xffa500,
          title: '➕ Added to Queue',
          description: `**[${song.title}](${song.url})**`,
          fields: [
            { name: '⏱️ Duration', value: song.duration, inline: true },
            { name: '📋 Position', value: `#${queue.songs.length}`, inline: true },
            { name: '👤 Requested by', value: song.requestedBy, inline: true },
          ],
        }],
      });
    }
  },
};
