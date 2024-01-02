import { SlashCommandBuilder } from 'discord.js';
import { command } from '../utils/discord/command.js';
import { db } from '../db/index.js';
import { eq, not, or } from 'drizzle-orm';
import { animes } from '../db/schema.js';

const meta = new SlashCommandBuilder()
  .setName('list-active-anime')
  .setDescription('List active animes.');

export default command(meta, async ({ interaction }) => {
  const result = await db.query.animes.findMany({
    where: or(not(eq(animes.status, 'dropped')), not(eq(animes.status, 'done')))
  });

  if (result.length === 0) {
    return interaction.reply({
      content: 'No result found.'
    });
  }

  return interaction.reply({
    content: result
      .map(
        (anime) =>
          `\nName: **${anime.name}**\nSeason: ${anime.season}\nEpisode: ${anime.episode}\nMax Episode: ${anime.maxEpisode}\nDay of Release: ${anime.dayOfRelease}\nStatus: ${anime.status}`
      )
      .join('\n\n')
  });
});
