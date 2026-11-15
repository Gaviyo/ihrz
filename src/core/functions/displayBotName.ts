/*
 * iHorizon Discord Bot — https://gitlab.com/ihrz/ihrz
 * Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International
 * License: https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Original work mainly developed by Kisakay (https://gitlab.com/Kisakay).
 * Copyright © 2020-2026 iHorizon. Modified: Discord embed footer branding uses Gavi.
 */

import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	Interaction,
	Message,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction
} from "discord.js";
import { LanguageData } from "../../../types/languageData.js";

export async function footerBuilder(guildId: string = ""): Promise<{
	text: string;
	iconURL: string;
}> {
	return {
		text: "Gavi",
		iconURL: "attachment://footer_icon.png"
	};
}

export async function footerPaginationBuilder(
	guildId: string,
	lang: LanguageData,
	page: number,
	maxPage: number
): Promise<{
	text: string;
	iconURL: string;
}> {
	const footer = await footerBuilder(guildId);

	return {
		text: `${footer.text} • ${lang.var_page} ${page}/${maxPage}`,
		iconURL: "attachment://footer_icon.png"
	};
}

export async function footerAttachmentBuilder(
	entry?:
		| ChatInputCommandInteraction<"cached">
		| Message
		| ButtonInteraction
		| UserContextMenuCommandInteraction
		| StringSelectMenuInteraction
		| Interaction
		| GuildMember
		| Guild
): Promise<{
	attachment: string | Buffer<ArrayBuffer>;
	name: string;
}> {
	const res = await displayBotPP(
		entry instanceof Guild ? entry.id : entry?.guild?.id!
	);

	if (res.type === 1) {
		return {
			attachment: res.string,
			name: "footer_icon.png"
		};
	} else {
		const buffer = Buffer.from(res.string, "base64");

		return {
			attachment: buffer,
			name: "footer_icon.png"
		};
	}
}

export async function displayBotPP(
	guildId?: string
): Promise<{ type: 1 | 2; string: string }> {
	let botPFP = (await global.client.db.get(
		`${guildId}.BOT.botPFP`
	)) as string | undefined;

	if (!botPFP) {
		botPFP = global.client.user?.displayAvatarURL({ size: 1024 })!;

		return { type: 1, string: botPFP };
	} else {
		return { type: 2, string: botPFP };
	}
}
