import { SlashCommandBuilder } from 'discord.js';
import { command } from '../utils/discord/command.js';
import { db } from '../db/index.js';

const meta = new SlashCommandBuilder()
  .setName('list-anime')
  .setDescription('List all animes.');

export default command(meta, async ({ interaction }) => {
  const animes = await db.query.animes.findMany();

  if (animes.length === 0) {
    return interaction.reply({
      content: 'No animes found.'
    });
  }

  return interaction.reply({
    content: animes
      .map(
        (anime) =>
          `\nName: **${anime.name}**\nSeason: ${anime.season}\nEpisode: ${anime.episode}\nMax Episode: ${anime.maxEpisode}\nDay of Release: ${anime.dayOfRelease}\nStatus: ${anime.status}`
      )
      .join('\n\n')
  });
});
