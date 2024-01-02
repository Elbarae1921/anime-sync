import { SlashCommandBuilder } from 'discord.js';
import { command } from '../utils/discord/command.js';
import { db } from '../db/index.js';
import { animes } from '../db/schema.js';
import { Reply } from '../utils/discord/reply.js';
import { findCandidates } from '../utils/anime.js';

const meta = new SlashCommandBuilder()
  .setName('add-anime')
  .setDescription('Ping the bot for a response.')
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
  )
  .addIntegerOption((option) =>
    option
      .setName('episode')
      .setDescription('The latest episode of the anime')
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName('max-episode')
      .setDescription('The number of the last episode of the anime')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('day-of-release')
      .setDescription('Day of release of the anime')
      .setRequired(true)
      .addChoices(
        { name: 'Monday', value: 'monday' },
        { name: 'Tuesday', value: 'tuesday' },
        { name: 'Wednesday', value: 'wednesday' },
        { name: 'Thursday', value: 'thursday' },
        { name: 'Friday', value: 'friday' },
        { name: 'Saturday', value: 'saturday' },
        { name: 'Sunday', value: 'sunday' }
      )
  )
  .addBooleanOption((option) =>
    option
      .setName('current')
      .setDescription('Download the current episode?')
      .setRequired(false)
  );

export default command(meta, async ({ interaction }) => {
  const name = interaction.options.getString('name');
  const season = interaction.options.getInteger('season');
  const episode = interaction.options.getInteger('episode');
  const maxEpisode = interaction.options.getInteger('max-episode');
  const dayOfRelease = interaction.options.getString(
    'day-of-release'
  ) as typeof animes.$inferSelect.dayOfRelease;
  const current = interaction.options.getBoolean('current');

  if (!name || !season || !episode || !maxEpisode || !dayOfRelease) {
    return interaction.reply(Reply.error('All arguments are required.'));
  }

  const [anime] = await db
    .insert(animes)
    .values({
      name,
      season,
      episode,
      maxEpisode,
      dayOfRelease,
      status: 'idle'
    })
    .returning();

  if (current) {
    findCandidates(anime, interaction.client);
  }

  return interaction.reply({
    content: `Added \nName: ${anime.name} \nSeason: ${anime.season} \nEpisode: ${anime.episode} \nMax Episode: ${anime.maxEpisode} \nDay of Release: ${anime.dayOfRelease} \nCurrent: ${current}`
  });
});
