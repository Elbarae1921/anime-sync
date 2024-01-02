import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '..', '..', '.env') });

import { REST, Routes, APIUser } from 'discord.js';
import commands from '../commands';

const body = commands.map(({ meta }) => meta).flat();

const token = process.env.TOKEN ?? '';
const guild = process.env.GUILD_ID ?? '';

const rest = new REST({ version: '10' }).setToken(token);

async function main() {
  const currentUser = (await rest.get(Routes.user())) as APIUser;

  const endpoint = Routes.applicationGuildCommands(currentUser.id, guild);

  await rest.put(endpoint, { body });

  return currentUser;
}

main()
  .then((user) => {
    const tag = `${user.username}#${user.discriminator}`;
    const response = `Successfully registered commands in ${guild} as ${tag}!`;
    console.log(response);
  })
  .catch(console.error);
