const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');
const { pickApp } = require('../picker');
const keyauth = require('../keyauth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('users')
    .setDescription('👥 Browse users for an app'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const app = await pickApp(interaction);
    if (!app) return;

    await interaction.editReply({ content: '🔄 Fetching users...', components: [] });
    const result = await keyauth.fetchUsers(app.ownerID, app.name);
    if (!result.success) return interaction.editReply({ content: `❌ ${result.message}` });

    const users = result.users || [];
    if (!users.length) return interaction.editReply({ content: '📭 No users found.' });

    const pages = [];
    for (let i = 0; i < users.length; i += 8) pages.push(users.slice(i, i + 8));
    let page = 0;

    const buildEmbed = p => new EmbedBuilder()
      .setTitle(`👥 Users — ${app.label}`)
      .setColor(0x57f287)
      .setFooter({ text: `Page ${p + 1}/${pages.length} • Total: ${users.length}` })
      .setTimestamp()
      .addFields(pages[p].map(u => ({
        name: `${u.banned === '1' ? '🚫' : '✅'} ${u.username}`,
        value: `Expiry: ${u.expiry || 'N/A'} • HWID: ${u.hwid ? u.hwid.substring(0, 12) + '...' : 'N/A'}`,
      })));

    const buildRow = p => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('users_prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
      new ButtonBuilder().setCustomId('users_next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(p === pages.length - 1),
    );

    await interaction.editReply({ embeds: [buildEmbed(page)], components: pages.length > 1 ? [buildRow(page)] : [] });

    if (pages.length > 1) {
      const btnCol = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => ['users_prev', 'users_next'].includes(i.customId) && i.user.id === interaction.user.id,
        time: 120000,
      });
      btnCol.on('collect', async btn => {
        page = btn.customId === 'users_next' ? Math.min(page + 1, pages.length - 1) : Math.max(page - 1, 0);
        await btn.update({ embeds: [buildEmbed(page)], components: [buildRow(page)] });
      });
    }
  },
};
