import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerEvents } from './utils/discord/event.js';
import events from './events/index.js';
import './db/index.js';
import { startCron } from './cron.js';
import WebTorrent from 'webtorrent';

const main = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
      Partials.User
    ]
  });

  await client.login(process.env.TOKEN).catch((err) => {
    console.error('[Login Error]', err);
    process.exit(1);
  });

  const torrentClient = new WebTorrent();

  registerEvents(events, client, torrentClient);

  startCron(client);
};

main();
