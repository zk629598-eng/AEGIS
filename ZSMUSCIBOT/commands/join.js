const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { createQueue } = require('../utils/queueManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join your current voice channel'),

  async execute(interaction, client) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel first!', ephemeral: true });
    }

    await interaction.deferReply();

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
        // still continue even if timeout
      }

      if (!client.queues.has(interaction.guild.id)) {
        const queue = createQueue(interaction.guild.id, connection, interaction.channel);
        client.queues.set(interaction.guild.id, queue);
      } else {
        const queue = client.queues.get(interaction.guild.id);
        queue.connection = connection;
        queue.textChannel = interaction.channel;
        connection.subscribe(queue.player);
      }

      await interaction.editReply({
        embeds: [{
          color: 0x5865f2,
          title: '🎵 Joined Voice Channel',
          description: `Connected to **${voiceChannel.name}**`,
          footer: { text: 'Use /play to start playing music!' },
        }],
      });
    } catch (err) {
      console.error('Join error:', err);
      await interaction.editReply('❌ Could not join the voice channel. Make sure I have Connect and Speak permissions!');
    }
  },
};
