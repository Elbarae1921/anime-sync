import { Events } from 'discord.js';
import { event } from '../utils/discord/event.js';
import { db } from '../db/index.js';
import { and, eq } from 'drizzle-orm';
import { messages } from '../db/schema.js';
import { downloadTorrent } from '../utils/anime.js';

const emojiToNumber: Record<string, number | undefined> = {
  '1️⃣': 0,
  '2️⃣': 1,
  '3️⃣': 2
};

export default event(
  Events.MessageReactionAdd,
  async ({ torrentClient, client }, reaction, user) => {
    if (reaction.partial) {
      await reaction.fetch();
    }
    const author = reaction.message.author;
    if (author?.id !== process.env.BOT_ID) return;

    if (!process.env.ALLOWED_USERS.includes(user.id)) return;

    const relatedMessage = await db.query.messages.findFirst({
      where: and(
        eq(messages.discordMessageId, reaction.message.id),
        eq(messages.isStale, false)
      ),
      with: { anime: true }
    });
    if (!relatedMessage) return;

    const number = emojiToNumber[reaction.emoji.name ?? ''];
    if (!number && number !== 0) return;

    const selectedTorrent = relatedMessage.data[number];

    await downloadTorrent(
      selectedTorrent,
      relatedMessage,
      client,
      torrentClient
    );

    await db
      .update(messages)
      .set({ isStale: true })
      .where(eq(messages.id, relatedMessage.id));
  }
);
