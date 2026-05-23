const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const yts = require('yt-search');
const { playSong } = require('../utils/queueManager');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { createQueue } = require('../utils/queueManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search YouTube and pick a song from the results')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Search term')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    await interaction.deferReply();

    let results;
    try {
      const res = await yts(query);
      results = res.videos.slice(0, 5);
    } catch (err) {
      return interaction.editReply('❌ Search failed: ' + err.message);
    }

    if (!results.length) {
      return interaction.editReply('❌ No results found for: **' + query + '**');
    }

    const options = results.map((v, i) => ({
      label: v.title.slice(0, 100),
      description: `${v.timestamp} • ${v.author.name}`.slice(0, 100),
      value: v.url,
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('search_select')
        .setPlaceholder('Choose a song...')
        .addOptions(options)
    );

    const embed = {
      color: 0x5865f2,
      title: `🔍 Search Results for: ${query}`,
      description: results.map((v, i) => `**${i + 1}.** [${v.title}](${v.url}) — \`${v.timestamp}\``).join('\n'),
      footer: { text: 'Select a song from the dropdown below' },
    };

    const reply = await interaction.editReply({ embeds: [embed], components: [row] });

    // Collect the selection
    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id && i.customId === 'search_select',
      time: 30_000,
      max: 1,
    });

    collector.on('collect', async i => {
      const url = i.values[0];
      const chosen = results.find(v => v.url === url);

      const member = interaction.member;
      const voiceChannel = member.voice?.channel;
      if (!voiceChannel) {
        return i.update({ content: '❌ Join a voice channel first!', embeds: [], components: [] });
      }

      await i.update({ embeds: [{ color: 0x1db954, title: '✅ Selected', description: `**${chosen.title}**` }], components: [] });

      let queue = client.queues.get(interaction.guild.id);
      if (!queue) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true,
        });
        await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
        queue = createQueue(interaction.guild.id, connection, interaction.channel);
        client.queues.set(interaction.guild.id, queue);
      }

      const song = {
        title: chosen.title,
        url: chosen.url,
        duration: chosen.timestamp,
        requestedBy: interaction.user.username,
      };

      if (!queue.playing || !queue.currentSong) {
        playSong(queue, song);
      } else {
        queue.songs.push(song);
        interaction.channel.send(`➕ Added **${song.title}** to the queue at position #${queue.songs.length}`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        interaction.editReply({ content: '⏰ Search timed out.', embeds: [], components: [] }).catch(() => {});
      }
    });
  },
};
