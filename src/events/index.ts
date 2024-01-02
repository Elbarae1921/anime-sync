import { DiscordEvent } from '../types.js';
import interactionCreate from './interactionCreate.js';
import ready from './ready.js';
import reaction from './reaction.js';

const events: DiscordEvent<any>[] = [ready, interactionCreate, reaction];

export default events;
