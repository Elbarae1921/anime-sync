import { SlashCommandBuilder } from 'discord.js';
import { command } from '../utils/discord/command.js';
import { db } from '../db/index.js';
import { animes } from '../db/schema.js';
import { Reply } from '../utils/discord/reply.js';
import { and, eq } from 'drizzle-orm';

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
};

const constructPayload = <T>(object: T): NoUndefinedField<T> => {
  const payload = {};
  for (const key in object) {
    if (object[key] !== null && object[key] !== undefined) {
      (payload as T)[key] = object[key];
    }
  }
  return payload as NoUndefinedField<T>;
};

const meta = new SlashCommandBuilder()
  .setName('edit-anime')
  .setDescription('Edit an anime.')
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
    option.setName('episode').setDescription('The latest episode of the anime')
  )
  .addIntegerOption((option) =>
    option
      .setName('max-episode')
      .setDescription('The number of the last episode of the anime')
  )
  .addStringOption((option) =>
    option
      .setName('day-of-release')
      .setDescription('Day of release of the anime')
      .addChoices(
        { name: 'Monday', value: 'monday' },
        { name: 'Tuesday', value: 'tuesday' },
        { name: 'Wednesday', value: 'wednesday' },
        { name: 'Thursday', value: 'thursday' },
        { name: 'Friday', value: 'friday' },
        { name: 'Saturday', value: 'saturday' },
        { name: 'Sunday', value: 'sunday' }
      )
  );

export default command(meta, async ({ interaction }) => {
  const name = interaction.options.getString('name');
  const season = interaction.options.getInteger('season');
  const episode = interaction.options.getInteger('episode');
  const maxEpisode = interaction.options.getInteger('max-episode');
  const dayOfRelease = interaction.options.getString('day-of-release') as
    | typeof animes.$inferSelect.dayOfRelease
    | null;

  if (!name || !season) {
    return interaction.reply(Reply.error('All arguments are required.'));
  }

  let anime = await db.query.animes.findFirst({
    where: and(eq(animes.name, name), eq(animes.season, season))
  });

  if (!anime) {
    return interaction.reply(Reply.error('No matching anime found'));
  }

  const data = {
    episode,
    maxEpisode,
    dayOfRelease,
    status: 'idle' as typeof animes.$inferSelect.status
  };

  const payload = constructPayload(data);

  [anime] = await db.update(animes).set(payload).returning();

  return interaction.reply({
    content: `Updated\nName: **${anime.name}**\nSeason: ${anime.season}\nEpisode: ${anime.episode}\nMax Episode: ${anime.maxEpisode}\nDay of Release: ${anime.dayOfRelease}`
  });
});
