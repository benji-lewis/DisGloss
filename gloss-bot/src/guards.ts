import { GuardFunction, ArgsOf } from "discordx";
import Redis from "ioredis";
import NodeCache from "node-cache";

const localCache = new NodeCache(); // Local cache with TTL
const redis = new Redis();

/**
 * Checks with R1 if a channel should be monitored.
 * 
 * @param {string} guildId - The ID of the guild the channel being checked belongs to.
 * @param {string} channelId - The ID of the channel being checked.
 * 
 * @returns {Promise<boolean>} - Whether the channel is monitored. 
 */
async function getMonitoredChannelFromDB(guildId: string, channelId: string): Promise<boolean> {
    return fetch(`${process.env.apiBase}/monitored-channels/${guildId}/${channelId}`).then((response) => {
        if (response.status == 200) return true;
        if (response.status == 404) return false;
        throw new Error("Unexpected response from DB API endpoint");
    });
};

/**
 * Checks the local cache and Redis to see if a channel should be monitored. 
 * 
 * @param {string} guildId - The ID of the guild the channel being checked belongs to.
 * @param {string} channelId - The ID of the channel being checked.
 * 
 * @returns {Promise<boolean>} - Whether the channel is monitored
 */
async function isMonitoredChannel(guildId: string, channelId: string): Promise<boolean> {
    const key = `${guildId}:${channelId}`;

    // 1. Check local cache first
    const local = localCache.get<boolean>(key);
    if (local) return true;

    // 2. Check Redis if not in local cache
    let isMonitored = false;
    try {
        const existsInRedis = await redis.exists(key);
        isMonitored = existsInRedis === 1;

        if (isMonitored) {
            // Cache the result locally to avoid future Redis calls
            localCache.set(key, true, 300); // Cache for 5 minutes
            return true;
        }
    } catch (error) {
        console.error("Redis lookup failed:", error);
        // Continue to the DB fallback even if Redis fails
    }

    // 3. Cache miss: Check the DB as the fallback (this should be outside the Redis try-catch)
    const existsInDB = await getMonitoredChannelFromDB(guildId, channelId);
    if (existsInDB) {
        // Update both Redis and the local cache with the result
        try {
            await redis.set(key, "1"); // Set in Redis without TTL for long-term storage
        } catch (error) {
            console.error("Failed to update Redis:", error);
        }
        localCache.set(key, true, 300); // Cache for 5 minutes locally
    }

    return existsInDB;
}

/**
 * Checks if the message was sent by a bot.
 */
export const NotBot: GuardFunction<ArgsOf<"messageCreate">> = async (
	[message],
	client,
	next,
) => {
	if (!client.user) return;
	if (client.user.id !== message.author.id) {
		await next();
	}
};

/**
 * Checks if the message was sent in a monitored channel.
 */
export const AllowedChannel: GuardFunction<ArgsOf<"messageCreate">> = async (
	[message],
	client,
	next,
) => {
	if (!message.guild) return;
	if (await isMonitoredChannel(message.guild.id, message.channel.id)) {
		await next();
	}
};
