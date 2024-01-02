import { Events } from 'discord.js';
import { event } from '../utils/discord/event.js';

export default event(Events.ClientReady, ({ log }, client) => {
  log(`Logged in as ${client.user.tag}`);
}, true);
