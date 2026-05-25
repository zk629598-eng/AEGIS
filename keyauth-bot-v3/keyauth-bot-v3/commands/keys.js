const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('keys')
    .setDescription('🔑 Browse license keys')
    .addStringOption(o =>
      o.setName('filter').setDescription('Filter').setRequired(false)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Used', value: 'used' },
          { name: 'Unused', value: 'unused' },
          { name: 'Banned', value: 'banned' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const app = await pickApp(interaction);
    if (!app) return;

    const filter = interaction.options.getString('filter') || 'all';
    await interaction.editReply({ content: '🔄 Fetching keys...', components: [] });

    const result = await keyauth.fetchKeys(app.ownerID, app.name);
    if (!result.success) return interaction.editReply({ content: `❌ ${result.message}` });

    let keys = result.keys || [];
    if (filter === 'used') keys = keys.filter(k => k.used === '1');
    else if (filter === 'unused') keys = keys.filter(k => k.used === '0');
    else if (filter === 'banned') keys = keys.filter(k => k.banned === '1');

    if (!keys.length) return interaction.editReply({ content: `📭 No keys found (filter: ${filter})` });

    const pages = [];
    for (let i = 0; i < keys.length; i += 10) pages.push(keys.slice(i, i + 10));
    let page = 0;

    const buildEmbed = p => new EmbedBuilder()
      .setTitle(`🔑 Keys — ${app.label} [${filter}]`)
      .setColor(0x5865f2)
      .setFooter({ text: `Page ${p + 1}/${pages.length} • Total: ${keys.length}` })
      .setTimestamp()
      .addFields(pages[p].map(k => ({
        name: `${k.banned === '1' ? '🚫' : k.used === '1' ? '✅' : '🆓'} \`${k.key}\``,
        value: `Used: ${k.used === '1' ? 'Yes' : 'No'} • Expiry: ${k.expiry || 'Never'}`,
      })));

    const buildRow = p => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('keys_prev').setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
      new ButtonBuilder().setCustomId('keys_next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(p === pages.length - 1),
    );

    await interaction.editReply({ embeds: [buildEmbed(page)], components: pages.length > 1 ? [buildRow(page)] : [] });

    if (pages.length > 1) {
      const btnCol = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => ['keys_prev', 'keys_next'].includes(i.customId) && i.user.id === interaction.user.id,
        time: 120000,
      });
      btnCol.on('collect', async btn => {
        page = btn.customId === 'keys_next' ? Math.min(page + 1, pages.length - 1) : Math.max(page - 1, 0);
        await btn.update({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
      });
    }
  },
};
