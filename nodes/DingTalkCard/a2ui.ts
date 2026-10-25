import { CardError, type Json } from './transport';

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
const keyPattern = /^[A-Za-z0-9_.:-]{1,64}$/;
const MAX_CONTENT_CHARS = 8000;
const MAX_ACTION_PARAM_STRING_CHARS = 1000;
const MAX_ACTION_PARAMS_JSON_CHARS = 8000;

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
/** Validate universal-v1 and map only to its fixed template variable contract. */
export function a2uiCardData(input: unknown): Json {
	const d = record(input, 'descriptor');
	fields(d, ['version', 'profile', 'title', 'summary', 'tone', 'blocks', 'actions'], 'descriptor');
	if (d.version !== '1') throw new CardError('Unsupported A2UI version. Supported version: "1".');
	if (d.profile !== 'universal-v1') throw new CardError('Unsupported A2UI profile. Supported profile: "universal-v1".');
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
