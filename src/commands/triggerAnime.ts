import { SlashCommandBuilder } from 'discord.js';
import { command } from '../utils/discord/command.js';
import { db } from '../db/index.js';
import { animes } from '../db/schema.js';
import { Reply } from '../utils/discord/reply.js';
import { and, eq } from 'drizzle-orm';
import { findCandidates } from '../utils/anime.js';

const meta = new SlashCommandBuilder()
  .setName('trigger-anime')
  .setDescription(
    'Trigger an anime to find available episodes and download them.'
  )
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Name of the anime')
      .setMinLength(1)
      .setMaxLength(200)
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('season')
      .setDescription('Season of the anime')
      .setRequired(true)
  );

export default command(meta, async ({ interaction }) => {
  const name = interaction.options.getString('name');
  const season = interaction.options.getInteger('season');

  if (!name || !season) {
    return interaction.reply(Reply.error('All arguments are required.'));
  }

  const anime = await db.query.animes.findFirst({
    where: and(eq(animes.name, name), eq(animes.season, season))
  });

  if (!anime) {
    return interaction.reply(Reply.error('No matching anime found'));
  }

  findCandidates(anime, interaction.client);

  return interaction.reply({
    content: 'Done'
  });
});
