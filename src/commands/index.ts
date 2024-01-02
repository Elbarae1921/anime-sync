import { DiscordCommand } from '../types.js';
import addAnime from './addAnime.js';
import dropAnime from './dropAnime.js';
import editAnime from './editAnime.js';
import listActiveAnime from './listActiveAnime.js';
import listAnime from './listAnime.js';
import ping from './ping.js';
import triggerAnime from './triggerAnime.js';

const commands: DiscordCommand[] = [
  ping,
  addAnime,
  listAnime,
  listActiveAnime,
  dropAnime,
  editAnime,
  triggerAnime
];

export default commands;
