import { DiscordCommand } from '../types.js';
import addAnime from './addAnime.js';
import ping from './ping.js';

const commands: DiscordCommand[] = [ping, addAnime];

export default commands;
