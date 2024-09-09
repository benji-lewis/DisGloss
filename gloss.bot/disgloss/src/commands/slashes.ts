import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class Config {
  @Slash({ description: "Configure the bot" })
  async config(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Placeholder for configuration options goes here");
  }
}
