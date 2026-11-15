/*
 * iHorizon Discord Bot (https://gitlab.com/ihrz/ihrz)
 * Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International
 * License: https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Original work mainly developed by Kisakay (https://gitlab.com/Kisakay).
 * Copyright © 2020-2026 iHorizon. Modified: Discord-facing language branding.
 */

import { LanguageData } from "../../../types/languageData.js";
import { AvailableLanguage, LangsData } from "./getLanguageData.ts";

// Built on first use: getLanguageData.ts imports this module too.
let langCodes: Set<string> | null = null;

const EMOJI_MARKER = "${emoji_";
const BRAND_PATTERN = /iHorizon/gi;

function replaceBranding(value: string): string {
	return value.replace(BRAND_PATTERN, "Gavi");
}

/**
 * Replaces every `${emoji_<Name>}` with the bot's emoji and applies the
 * requested display name consistently to localized Discord-facing text.
 */
function resolveEmojis(value: string, emojis: Record<string, string>): string {
	let start = value.indexOf(EMOJI_MARKER);
	if (start === -1) return replaceBranding(value);

	let out = "";
	let from = 0;
	while (start !== -1) {
		const end = value.indexOf("}", start);
		if (end === -1) break;
		const name = value.slice(start + EMOJI_MARKER.length, end);
		out +=
			value.slice(from, start) +
			(emojis[name] ?? value.slice(start, end + 1));
		from = end + 1;
		start = value.indexOf(EMOJI_MARKER, from);
	}
	return replaceBranding(out + value.slice(from));
}

function withEmojis(
	lang: LanguageData,
	emojis: Record<string, string>
): LanguageData {
	const resolved: Record<string, string | string[]> = {};
	for (const [key, value] of Object.entries(lang)) {
		resolved[key] = Array.isArray(value)
			? value.map((line) => resolveEmojis(line, emojis))
			: resolveEmojis(value, emojis);
	}
	return resolved as LanguageData;
}

function withBranding(lang: LanguageData): LanguageData {
	const resolved: Record<string, string | string[]> = {};
	for (const [key, value] of Object.entries(lang)) {
		resolved[key] = Array.isArray(value)
			? value.map(replaceBranding)
			: replaceBranding(value);
	}
	return resolved as LanguageData;
}

export default async function getLanguageDataByCode(
	locale: string
): Promise<LanguageData> {
	// The locale comes from guild / user settings: only known codes may
	// reach the dynamic import.
	langCodes ??= new Set(AvailableLanguage.map((language) => language.code));
	const code = langCodes.has(locale) ? locale : "en-US";

	const cached = LangsData[code];
	if (cached) return cached;

	const raw = (await import(`../../lang/${code}.ts`)).default as LanguageData;
	const emojis = globalThis.client?.iHorizon_Emojis as
		Record<string, string> | undefined;
	// Before the emoji sync (ready event), still apply the chosen display
	// name. Cache only the emoji-resolved version once emojis are available.
	if (!emojis) return withBranding(raw);

	const lang = withEmojis(raw, emojis);
	LangsData[code] = lang;
	return lang;
}
