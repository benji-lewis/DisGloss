import { ApplicationCommandType, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { ContextMenu, Discord, On } from "discordx";

@Discord()
class UserInteraction {
  @ContextMenu({
    name: "Explain these acronyms",
    type: ApplicationCommandType.Message,
  })
  messageHandler(interaction: MessageContextMenuCommandInteraction): void {
    console.log("Explain button clicked");
    interaction.reply("Placeholder for proper explanation message goes here");
  }
}

@Discord()
class DictionaryMonitor {
  @On({ event: "messageCreate" })
  onMessage(
    [message]: ArgsOf<"messageCreate">,
    client: Client,
    guardPayload: any,
  ) {
    console.log("Message created");
  }
}