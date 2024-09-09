import { ApplicationCommandType, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { ContextMenu, Discord, Guard, On } from "discordx";
import { AllowedChannel, NotBot } from "../guards";

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
  @Guard(NotBot, AllowedChannel)
  onMessage(
    [message]: ArgsOf<"messageCreate">,
    client: Client,
    guardPayload: any,
  ) { fetch(`${process.env.QUEUE_PRODUCER}/message`, { method: "POST", body: JSON.stringify(message) }); }
}