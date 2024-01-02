import { Client } from 'discord.js';
import { processAnimes } from './utils/anime.js';

export const startCron = (client: Client) => {
  processAnimes(client);
  setInterval(async () => {
    processAnimes(client);
  }, 1000 * 60 * 60);
};
