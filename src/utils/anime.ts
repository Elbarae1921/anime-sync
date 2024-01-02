import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { animes, messages } from '../db/schema.js';
import { si } from 'nyaapi';
import { Client, TextChannel } from 'discord.js';
import { NyaaResult } from '../types.js';
import WebTorrent from 'webtorrent';

const formatSeasonEpisode = (season: number, episode: number) => {
  return `S${season.toString().padStart(2, '0')}E${episode
    .toString()
    .padStart(2, '0')}`;
};

export const search = ({ title }: { title: string }) => {
  return si.search(title, 3, {
    category: '1_2',
    sort: 'seeders',
    direction: 'desc'
  });
};

export const findCandidates = async (
  anime: typeof animes.$inferSelect,
  client: Client
) => {
  console.log('Finding candidates for: ', anime.name);
  const results = await search({
    title: `${anime.name} ${formatSeasonEpisode(anime.season, anime.episode)}`
  });

  console.log('Found candidates: ', results.length);

  if (results.length === 0) {
    return db
      .update(animes)
      .set({ status: 'idle' })
      .where(and(eq(animes.name, anime.name), eq(animes.season, anime.season)));
  }

  const candidates: NyaaResult[] = results.map((result) => ({
    name: result.name,
    url: result.magnet,
    seeders: result.seeders,
    leechers: result.leechers,
    size: result.filesize,
    date: result.date
  }));

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = (await guild?.channels.fetch(
    process.env.CHANNEL_ID
  )) as TextChannel;

  const discordMessage = await channel.send({
    content: `
    **ℹ️ Please choose a torrent for ${anime.name} season ${
      anime.season
    } episode ${anime.episode}**
    ${candidates
      .map(
        (candidate, i) => `
    - ${i === 0 ? ':one:' : i === 1 ? ':two:' : ':three:'} :
      - Name: ${candidate.name}
      - Size: **${candidate.size}**
      - Seeders: **${candidate.seeders}**
      - Leechers: ${candidate.leechers}
      - Date: ${candidate.date}
    `
      )
      .join('')}

    - ❌ to dismiss
    `
  });

  await Promise.all([
    discordMessage.react('1️⃣'),
    discordMessage.react('2️⃣'),
    discordMessage.react('3️⃣'),
    discordMessage.react('❌')
  ]);

  await db.insert(messages).values({
    animeId: anime.id,
    data: candidates,
    discordMessageId: discordMessage.id
  });

  console.log('Candidates sent to channel.');

  await db
    .update(animes)
    .set({ status: 'awaitingConfirmation' })
    .where(and(eq(animes.name, anime.name), eq(animes.season, anime.season)));
};

const numberToDay: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export const processAnimes = async (client: Client) => {
  console.log('Checking animes...');
  const dow = numberToDay[
    new Date().getDay()
  ] as typeof animes.$inferSelect.dayOfRelease;
  const results = await db.query.animes.findMany({
    where: and(eq(animes.status, 'idle'), eq(animes.dayOfRelease, dow))
  });

  console.log('Found animes: ', results.length);

  for (const anime of results) {
    await findCandidates(anime, client);
  }
};

export const downloadTorrent = async (
  chosenTorrent: NyaaResult,
  message: typeof messages.$inferSelect & { anime: typeof animes.$inferSelect },
  client: Client,
  torrentClient: WebTorrent.Instance
) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = (await guild?.channels.fetch(
    process.env.CHANNEL_ID
  )) as TextChannel;

  torrentClient.add(
    chosenTorrent.url,
    { path: process.env.TORRENT_PATH },
    async (torrent) => {
      const messageContent = `**🔃 Downloading ${message.anime.name} season ${message.anime.season} episode ${message.anime.episode}**\n- Name: ${chosenTorrent.name}\n- Magnet: ${chosenTorrent.url}\n- Size: **${chosenTorrent.size}**\n- Seeders: **${chosenTorrent.seeders}**\n- Leechers: ${chosenTorrent.leechers}\n- Date: ${chosenTorrent.date}`;
      const progressMessage = await channel.send({
        content: messageContent
      });

      let lastPercent = 0;
      torrent.on('download', async () => {
        const percent = Math.floor(torrent.progress * 100);
        if (percent > lastPercent + 5) {
          lastPercent = percent;
          await progressMessage.edit({
            content: messageContent + `\n- Progress: ${percent}%`
          });
        }
      });

      torrent.on('done', async () => {
        await channel.send({
          content: `
        **✅ Downloaded ${message.anime.name} season ${
            message.anime.season
          } episode ${message.anime.episode}**
        - Paths:
        ${torrent.files
          .map((file) => `- ${encodeURI(process.env.PUBLIC_URL + file.path)}`)
          .join('')}
        `
        });
        if (message.anime.episode === message.anime.maxEpisode) {
          await db
            .update(animes)
            .set({ status: 'done' })
            .where(eq(animes.id, message.animeId));
        } else {
          await db
            .update(animes)
            .set({ episode: message.anime.episode + 1, status: 'idle' })
            .where(eq(animes.id, message.animeId));
        }
      });
    }
  );
};
