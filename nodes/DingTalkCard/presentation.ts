import { CardError, object, type Json } from './transport';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
type Tone = (typeof tones)[number];
type Family = 'alert' | 'status' | 'digest' | 'action' | 'report';
const states = ['idle', 'running', 'success', 'failed', 'cancelled'] as const;

function record(value: unknown, label: string): Record<string, unknown> {
	if (!object(value)) throw new CardError(`Presentation ${label} must be an object.`);
	return value;
}
function fields(value: Record<string, unknown>, allowed: string[], label: string): void {
	for (const key of Object.keys(value))
		if (!allowed.includes(key)) throw new CardError(`Unknown Presentation ${label} field "${key}".`);
}
function string(value: unknown, label: string, max = 1000): string {
	if (typeof value !== 'string' || !value.trim() || value.length > max)
		throw new CardError(`Presentation ${label} must be a non-empty string of at most ${max} characters.`);
	return value;
}
function optionalString(value: unknown, label: string, max = 1000): string | undefined {
	return value === undefined ? undefined : string(value, label, max);
}
function tone(value: unknown): Tone {
	if (typeof value !== 'string' || !(tones as readonly string[]).includes(value))
		throw new CardError(`Presentation tone must be one of: ${tones.join(', ')}.`);
	return value as Tone;
}
function list(value: unknown, label: string): unknown[] {
	if (!Array.isArray(value) || value.length < 1 || value.length > 20)
		throw new CardError(`Presentation ${label} must contain between 1 and 20 items.`);
	return value;
}
function json(value: unknown): string {
	return JSON.stringify(value);
}

/** Validate a v1 presentation descriptor and map it to Form-mode cardData. */
export function presentationCardData(input: unknown): Json {
	const d = record(input, 'descriptor');
	if (d.version !== '1') throw new CardError('Unsupported Presentation version. Supported version: "1".');
	const family = d.family;
	if (!['alert', 'status', 'digest', 'action', 'report'].includes(String(family)))
		throw new CardError('Unsupported Presentation family.');
	const common = ['version', 'family', 'title', 'summary', 'tone'];
	const map: Record<string, string> = Object.create(null);
	map.presentationVersion = '1';
	map.presentationFamily = family as string;
	map.flowStatus = '3';
	map.title = string(d.title, 'title', 200);
	const summary = optionalString(d.summary, 'summary');
	if (summary !== undefined) map.summary = summary;
	map.tone = tone(d.tone);
	const familyFields: Record<Family, string[]> = {
		alert: ['source', 'occurredAt'],
		status: ['state', 'details'],
		digest: ['items'],
		action: ['label', 'description'],
		report: ['sections'],
	};
	fields(d, [...common, ...familyFields[family as Family]], 'descriptor');
	switch (family as Family) {
		case 'alert': {
			const source = optionalString(d.source, 'source', 200);
			const occurredAt = optionalString(d.occurredAt, 'occurredAt', 100);
			if (source !== undefined) map.source = source;
			if (occurredAt !== undefined) map.occurredAt = occurredAt;
			break;
		}
		case 'status':
			if (typeof d.state !== 'string' || !(states as readonly string[]).includes(d.state))
				throw new CardError(`Presentation state must be one of: ${states.join(', ')}.`);
			map.state = d.state;
			if (d.details !== undefined) map.details = string(d.details, 'details');
			break;
		case 'digest': {
			const items = list(d.items, 'items').map((raw, i) => {
				const item = record(raw, `items[${i}]`);
				fields(item, ['title', 'summary', 'tone'], `items[${i}]`);
				const entry: Record<string, string> = { title: string(item.title, `items[${i}].title`, 200) };
				const itemSummary = optionalString(item.summary, `items[${i}].summary`);
				if (itemSummary !== undefined) entry.summary = itemSummary;
				if (item.tone !== undefined) entry.tone = tone(item.tone);
				return entry;
			});
			map.items = json(items);
			break;
		}
		case 'action':
			map.label = string(d.label, 'label', 100);
			if (d.description !== undefined) map.description = string(d.description, 'description');
			break;
		case 'report': {
			const sections = list(d.sections, 'sections').map((raw, i) => {
				const section = record(raw, `sections[${i}]`);
				fields(section, ['heading', 'body'], `sections[${i}]`);
				return {
					heading: string(section.heading, `sections[${i}].heading`, 200),
					body: string(section.body, `sections[${i}].body`),
				};
			});
			map.sections = json(sections);
			break;
		}
	}
	return { cardParamMap: map };
}
