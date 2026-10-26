/* eslint-disable @n8n/community-nodes/require-node-api-error -- Pure A2UI validation throws CardError; the node boundary converts it to NodeOperationError with item context. */
import { CardError, type Json } from './transport';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
const keyPattern = /^[A-Za-z0-9_.:-]{1,64}$/;
const MAX_CONTENT_CHARS = 8000;
const MAX_ACTION_PARAM_STRING_CHARS = 1000;
const MAX_ACTION_PARAMS_JSON_CHARS = 8000;
const MAX_V2_BODY_CHARS = 8000;
const MAX_V2_ACTIONS_CHARS = 2000;
const htmlTagPattern = /<\s*\/?\s*[A-Za-z][^>]*>/;
const markdownLinkPattern = /!?\[[^\]]*\]\([^)]*\)/;

function record(value: unknown, label: string): Record<string, unknown> {
	if (value === null || typeof value !== 'object' || Array.isArray(value))
		throw new CardError(`A2UI ${label} must be an object.`);
	return value as Record<string, unknown>;
}
function fields(value: Record<string, unknown>, allowed: string[], label: string): void {
	for (const key of Object.keys(value))
		if (!allowed.includes(key)) throw new CardError(`Unknown A2UI ${label} field "${key}".`);
}
function string(value: unknown, label: string, max: number): string {
	if (typeof value !== 'string' || value.length > max)
		throw new CardError(`A2UI ${label} must be a string of at most ${max} characters.`);
	return value;
}
function nonEmptyString(value: unknown, label: string, max: number): string {
	const result = string(value, label, max);
	if (!result.trim()) throw new CardError(`A2UI ${label} must be a non-empty string of at most ${max} characters.`);
	return result;
}
function markdown(value: unknown, label: string, max: number): string {
	const result = string(value, label, max);
	if (htmlTagPattern.test(result)) throw new CardError(`A2UI ${label} must not contain HTML tags.`);
	if (markdownLinkPattern.test(result))
		throw new CardError(`A2UI ${label} must put links in the structured links field.`);
	return result;
}
function nonEmptyMarkdown(value: unknown, label: string, max: number): string {
	const result = markdown(value, label, max);
	if (!result.trim()) throw new CardError(`A2UI ${label} must be non-empty.`);
	return result;
}
function escapeMarkdown(value: string): string {
	return value.replace(/[\\`*_{}[\]()#+\-.!|<>]/g, '\\$&');
}
function safeHttpUrl(value: unknown, label: string): string {
	const raw = nonEmptyString(value, label, 2000);
	if (raw.trim() !== raw) throw new CardError(`A2UI ${label} must not have leading or trailing whitespace.`);
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		throw new CardError(`A2UI ${label} must be a valid absolute HTTP(S) URL.`);
	}
	if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password)
		throw new CardError(`A2UI ${label} must be a valid absolute HTTP(S) URL without embedded credentials.`);
	return parsed.toString().replace(/\(/g, '%28').replace(/\)/g, '%29');
}
function renderLink(raw: unknown, label: string): string {
	const link = record(raw, label);
	fields(link, ['label', 'url'], label);
	const text = nonEmptyString(link.label, `${label}.label`, 100);
	const url = safeHttpUrl(link.url, `${label}.url`);
	return `[${escapeMarkdown(text)}](${url})`;
}
function renderLinks(value: unknown, label: string, maxItems = 8): string[] {
	if (value === undefined) return [];
	if (!Array.isArray(value) || value.length > maxItems)
		throw new CardError(`A2UI ${label} must contain at most ${maxItems} links.`);
	return value.map((item, i) => renderLink(item, `${label}[${i}]`));
}

function universalV1(d: Record<string, unknown>): Json {
	fields(d, ['version', 'profile', 'title', 'summary', 'tone', 'blocks', 'actions'], 'descriptor');
	const title = nonEmptyString(d.title, 'title', 200);
	const summary = d.summary === undefined ? undefined : string(d.summary, 'summary', 1000);
	if (typeof d.tone !== 'string' || !(tones as readonly string[]).includes(d.tone))
		throw new CardError(`A2UI tone must be one of: ${tones.join(', ')}.`);
	if (!Array.isArray(d.blocks) || d.blocks.length < 1 || d.blocks.length > 12)
		throw new CardError('A2UI blocks must contain between 1 and 12 items.');
	const rendered = d.blocks.map((raw, i) => {
		const block = record(raw, `blocks[${i}]`);
		if (block.type === 'text') {
			fields(block, ['type', 'text'], `blocks[${i}]`);
			return string(block.text, `blocks[${i}].text`, 1000);
		}
		if (block.type === 'keyValue') {
			fields(block, ['type', 'label', 'value'], `blocks[${i}]`);
			return `${nonEmptyString(block.label, `blocks[${i}].label`, 100)}: ${string(block.value, `blocks[${i}].value`, 1000)}`;
		}
		if (block.type === 'list') {
			fields(block, ['type', 'items'], `blocks[${i}]`);
			if (!Array.isArray(block.items) || block.items.length < 1 || block.items.length > 20)
				throw new CardError(`A2UI blocks[${i}].items must contain between 1 and 20 strings.`);
			return block.items.map((item, j) => `• ${string(item, `blocks[${i}].items[${j}]`, 300)}`).join('\n');
		}
		throw new CardError(`Unsupported A2UI block type at blocks[${i}].`);
	}).join('\n');
	if (rendered.length > MAX_CONTENT_CHARS)
		throw new CardError(`A2UI rendered content must be at most ${MAX_CONTENT_CHARS} characters.`);
	const map: Record<string, string> = {
		a2uiVersion: '1', a2uiProfile: 'universal-v1', a2uiTitle: title,
		a2uiTone: d.tone, a2uiContent: rendered,
		flowStatus: '3',
	};
	if (summary !== undefined) map.a2uiSummary = summary;
	if (d.actions !== undefined) {
		if (!Array.isArray(d.actions) || d.actions.length > 1)
			throw new CardError('A2UI actions must contain at most 1 request action.');
		if (d.actions.length) {
			const action = record(d.actions[0], 'action');
			fields(action, ['type', 'id', 'label', 'params'], 'action');
			if (action.type !== 'request') throw new CardError('A2UI action type must be "request".');
			if (typeof action.id !== 'string' || !keyPattern.test(action.id))
				throw new CardError('A2UI action id must match [A-Za-z0-9_.:-]{1,64}.');
			map.a2uiActionId = action.id;
			map.a2uiActionLabel = nonEmptyString(action.label, 'action label', 100);
			map.a2uiActionVisible = 'true';
			if (action.params !== undefined) {
				const params = record(action.params, 'action params');
				const keys = Object.keys(params).sort();
				if (keys.length > 20) throw new CardError('A2UI action params must contain at most 20 keys.');
				const ordered = Object.create(null) as Record<string, string | number | boolean | null>;
				for (const key of keys) {
					const value = params[key];
					if (!keyPattern.test(key)) throw new CardError('A2UI action param keys must match [A-Za-z0-9_.:-]{1,64}.');
					if (value !== null && !['string', 'number', 'boolean'].includes(typeof value))
						throw new CardError(`A2UI action param "${key}" must be a scalar string, number, boolean, or null.`);
					if (typeof value === 'string' && value.length > MAX_ACTION_PARAM_STRING_CHARS)
						throw new CardError(`A2UI action param "${key}" string must be at most ${MAX_ACTION_PARAM_STRING_CHARS} characters.`);
					if (typeof value === 'number' && !Number.isFinite(value))
						throw new CardError(`A2UI action param "${key}" must be finite.`);
					ordered[key] = value as string | number | boolean | null;
				}
				const serialized = JSON.stringify(ordered);
				if (serialized.length > MAX_ACTION_PARAMS_JSON_CHARS)
					throw new CardError(`A2UI serialized action params must be at most ${MAX_ACTION_PARAMS_JSON_CHARS} characters.`);
				map.a2uiActionParams = serialized;
			}
		}
	}
	map.a2uiActionVisible ??= 'false';
	return { cardParamMap: map };
}

function universalV2(d: Record<string, unknown>): Json {
	fields(d, ['version', 'profile', 'title', 'summary', 'summaryMarkdown', 'tone', 'status', 'generatedAt', 'source', 'metrics', 'sections', 'links', 'footer'], 'descriptor');
	const title = nonEmptyString(d.title, 'title', 200);
	const summary = nonEmptyString(d.summary, 'summary', 1000);
	const summaryMarkdown = d.summaryMarkdown === undefined
		? escapeMarkdown(summary)
		: nonEmptyMarkdown(d.summaryMarkdown, 'summaryMarkdown', 1000);
	if (typeof d.tone !== 'string' || !(tones as readonly string[]).includes(d.tone))
		throw new CardError(`A2UI tone must be one of: ${tones.join(', ')}.`);
	const tone = d.tone as (typeof tones)[number];
	const status = d.status === undefined ? tone.toUpperCase() : nonEmptyString(d.status, 'status', 50);
	const generatedAt = d.generatedAt === undefined ? undefined : nonEmptyString(d.generatedAt, 'generatedAt', 100);
	const source = d.source === undefined ? undefined : nonEmptyString(d.source, 'source', 200);
	const footer = d.footer === undefined ? '' : markdown(d.footer, 'footer', 500);
	if (!Array.isArray(d.metrics) || d.metrics.length !== 4)
		throw new CardError('A2UI universal-v2 metrics must contain exactly 4 items for the published wide template.');
	const metrics = d.metrics.map((raw, i) => {
		const metric = record(raw, `metrics[${i}]`);
		fields(metric, ['label', 'value'], `metrics[${i}]`);
		return {
			label: nonEmptyString(metric.label, `metrics[${i}].label`, 100),
			value: nonEmptyString(metric.value, `metrics[${i}].value`, 1000),
		};
	});
	if (d.sections !== undefined && (!Array.isArray(d.sections) || d.sections.length > 8))
		throw new CardError('A2UI universal-v2 sections must contain at most 8 items.');
	const bodyParts: string[] = [];
	for (const [i, raw] of ((d.sections ?? []) as unknown[]).entries()) {
		const section = record(raw, `sections[${i}]`);
		fields(section, ['title', 'markdown', 'links'], `sections[${i}]`);
		const sectionTitle = nonEmptyString(section.title, `sections[${i}].title`, 100);
		const sectionMarkdown = markdown(section.markdown, `sections[${i}].markdown`, 3000);
		const sectionLinks = renderLinks(section.links, `sections[${i}].links`);
		const sectionParts = [`## ${escapeMarkdown(sectionTitle)}`];
		if (sectionMarkdown) sectionParts.push(sectionMarkdown);
		if (sectionLinks.length) sectionParts.push(sectionLinks.map((link) => `- ${link}`).join('\n'));
		bodyParts.push(sectionParts.join('\n'));
	}
	const body = bodyParts.join('\n\n');
	if (body.length > MAX_V2_BODY_CHARS)
		throw new CardError(`A2UI universal-v2 rendered body must be at most ${MAX_V2_BODY_CHARS} characters.`);
	const rootLinks = renderLinks(d.links, 'links');
	const actions = rootLinks.length ? `### 快捷入口\n${rootLinks.map((link) => `- ${link}`).join('\n')}` : '';
	if (actions.length > MAX_V2_ACTIONS_CHARS)
		throw new CardError(`A2UI universal-v2 rendered links must be at most ${MAX_V2_ACTIONS_CHARS} characters.`);
	const icons: Record<(typeof tones)[number], string> = {
		neutral: '⚪', info: '🔵', success: '🟢', warning: '🟠', danger: '🔴',
	};
	const meta = [`${icons[tone]} **${escapeMarkdown(status)}**`];
	if (generatedAt) meta.push(escapeMarkdown(generatedAt));
	if (source) meta.push(escapeMarkdown(source));
	const map: Record<string, string> = {
		title,
		summary_text: summary,
		meta_markdown: meta.join('　·　'),
		summary_markdown: summaryMarkdown,
		metric1_label: metrics[0].label,
		metric1_value: metrics[0].value,
		metric2_label: metrics[1].label,
		metric2_value: metrics[1].value,
		metric3_label: metrics[2].label,
		metric3_value: metrics[2].value,
		metric4_label: metrics[3].label,
		metric4_value: metrics[3].value,
		body_markdown: body,
		actions_markdown: actions,
		footer_markdown: footer,
		config: JSON.stringify({ autoLayout: true }),
	};
	return { cardParamMap: map };
}

/** Validate a supported fixed A2UI profile and map only to its published template variable contract. */
export function a2uiCardData(input: unknown): Json {
	const d = record(input, 'descriptor');
	if (d.version === '1' && d.profile === 'universal-v1') return universalV1(d);
	if (d.version === '2' && d.profile === 'universal-v2') return universalV2(d);
	throw new CardError('Unsupported A2UI version/profile pair. Supported pairs: "1"/"universal-v1" and "2"/"universal-v2".');
}
