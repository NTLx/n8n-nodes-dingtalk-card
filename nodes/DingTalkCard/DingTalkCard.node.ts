import type {
	ICredentialTestFunctions,
	ICredentialsDecrypted,
	ICredentialDataDecryptedObject,
	INodeCredentialTestResult,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeProperties,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildRequest, formCardData, jsonObject, type Operation } from './payload';
import { presentationCardData } from './presentation';
import { a2uiCardData } from './a2ui';
import { CardError, createClient, type CardErrorDetails, type Json } from './transport';

const operations = ['createAndDeliver', 'update'];
const streamOperations = ['stream', 'finalize'];
const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createAndDeliver',
		options: [
			{
				name: 'Create & Deliver',
				value: 'createAndDeliver',
				action: 'Create and deliver a card',
				description: 'Create a template instance and deliver it to a space',
			},
			{
				name: 'Finalize',
				value: 'finalize',
				action: 'Finalize a card stream',
				description: 'Close a stream in completed or error state',
			},
			{
				name: 'Streaming Update',
				value: 'stream',
				action: 'Stream an update to a card',
				description: 'Send one full or incremental frame',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a card',
				description: 'Update an existing card instance',
			},
		],
	},
	{
		displayName: 'Input Mode',
		name: 'inputMode',
		type: 'options',
		noDataExpression: true,
		default: 'form',
		options: [
			{ name: 'Form', value: 'form' },
			{ name: 'JSON', value: 'json' },
		],
		description: 'Use guided fields or supply the official API request body',
	},
	{
		displayName: 'Presentation Descriptor',
		name: 'presentationDescriptor',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: {
			show: { inputMode: ['form'], operation: operations, cardDataMode: ['presentation'] },
		},
		description: 'Versioned presentation descriptor mapped to the documented template variables',
	},
	{
		displayName: 'A2UI Descriptor',
		name: 'a2uiDescriptor',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: {
			show: { inputMode: ['form'], operation: operations, cardDataMode: ['a2ui'] },
		},
		description: 'Constrained universal-v1 or universal-v2 descriptor mapped to fixed A2UI template variables',
	},
	{
		displayName: 'Request Body',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: { show: { inputMode: ['json'] } },
		description:
			'Official request JSON. A missing outTrackId is generated only for Create & Deliver. A missing streaming guid is generated. Finalize forces the terminal state.',
	},
	{
		displayName: 'Out Track ID',
		name: 'outTrackId',
		type: 'string',
		default: '',
		displayOptions: { show: { inputMode: ['form'] } },
		description:
			'External card identifier. Leave empty only when creating to generate a UUID. Reuse the output identifier for updates.',
	},
	{
		displayName: 'Enable Stream Callbacks',
		name: 'enableStreamCallbacks',
		type: 'boolean',
		default: false,
		displayOptions: { show: { inputMode: ['form'], operation: ['createAndDeliver'] } },
		description:
			'Whether to route interactions to a DingTalk Card Trigger using the same Client ID. Acknowledgements are immediate; updates are asynchronous.',
	},
	{
		displayName: 'Card Template ID',
		name: 'cardTemplateId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { inputMode: ['form'], operation: ['createAndDeliver'] } },
		description: 'Published template belonging to your DingTalk app',
	},
	{
		displayName: 'Card Data Mode',
		name: 'cardDataMode',
		type: 'options',
		noDataExpression: true,
		default: 'form',
		options: [
			{ name: 'Form', value: 'form' },
			{ name: 'JSON', value: 'json' },
			{ name: 'Presentation', value: 'presentation' },
			{ name: 'A2UI', value: 'a2ui' },
		],
		displayOptions: { show: { inputMode: ['form'], operation: operations } },
	},
	{
		displayName: 'Card Parameters',
		name: 'cardParameters',
		type: 'fixedCollection',
		default: {},
		typeOptions: { multipleValues: true },
		displayOptions: {
			show: { inputMode: ['form'], operation: operations, cardDataMode: ['form'] },
		},
		options: [
			{
				displayName: 'Parameter',
				name: 'parameters',
				values: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
					{
						displayName: 'Value Mode',
						name: 'valueMode',
						type: 'options',
						default: 'string',
						options: [
							{ name: 'String', value: 'string' },
							{ name: 'JSON', value: 'json' },
						],
						description: 'String preserves the value as entered. JSON parses and serializes one JSON value.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value text. In JSON mode, enter a valid JSON object, array, or scalar.',
					},
				],
			},
		],
	},
	{
		displayName: 'Card Data',
		name: 'cardData',
		type: 'json',
		default: '{"cardParamMap":{}}',
		required: true,
		displayOptions: {
			show: { inputMode: ['form'], operation: operations, cardDataMode: ['json'] },
		},
		description: 'Official cardData object containing a cardParamMap of string values',
	},
	{
		displayName: 'Delivery Target',
		name: 'target',
		type: 'options',
		default: 'group',
		options: [
			{ name: 'Group Chat', value: 'group' },
			{ name: 'Robot Direct Message', value: 'robot' },
		],
		displayOptions: { show: { inputMode: ['form'], operation: ['createAndDeliver'] } },
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { inputMode: ['form'], operation: ['createAndDeliver'] } },
		description:
			'Group openConversationId or direct-message staff userId. JSON mode supports additional spaces and models.',
	},
	{
		displayName: 'Robot Code',
		name: 'robotCode',
		type: 'string',
		default: '',
		displayOptions: { show: { inputMode: ['form'], operation: ['createAndDeliver'] } },
		description:
			'Optional override. Leave blank to use the bound credential’s Client ID / AppKey for the application’s own enterprise robot. Robot must have access to the target.',
	},
	{
		displayName: 'Update by Key',
		name: 'updateByKey',
		type: 'boolean',
		default: true,
		displayOptions: { show: { inputMode: ['form'], operation: ['update'] } },
		description:
			'Whether to merge supplied public parameters instead of replacing all public card data',
	},
	{
		displayName: 'Streaming Key',
		name: 'key',
		type: 'string',
		default: 'msgContent',
		required: true,
		displayOptions: { show: { inputMode: ['form'], operation: streamOperations } },
		description:
			'Template variable bound to a streaming component; msgContent for the public default AI template. Override for custom templates.',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { inputMode: ['form'], operation: streamOperations } },
		description:
			'Full content when Is Full is enabled; empty is allowed. Markdown requires full content. See API size limits in README.',
	},
	{
		displayName: 'Request GUID',
		name: 'guid',
		type: 'string',
		default: '',
		displayOptions: { show: { inputMode: ['form'], operation: streamOperations } },
		description:
			'Idempotency identifier for this frame. Empty generates a UUID; retain it when intentionally replaying a frame.',
	},
	{
		displayName: 'Is Full',
		name: 'isFull',
		type: 'boolean',
		default: true,
		displayOptions: { show: { inputMode: ['form'], operation: streamOperations } },
		description:
			'Whether to replace the streaming value. Required for Markdown; disable only for incremental plain text.',
	},
	{
		displayName: 'Is Finalize',
		name: 'isFinalize',
		type: 'boolean',
		default: false,
		displayOptions: { show: { inputMode: ['form'], operation: ['stream'] } },
		description: 'Whether this is the final frame, moving the card into completed state',
	},
	{
		displayName: 'Is Error',
		name: 'isError',
		type: 'boolean',
		default: false,
		displayOptions: { show: { inputMode: ['form'], operation: streamOperations } },
		description:
			'Whether to move the card into error state. Finalize sends isFinalize=false when this is enabled.',
	},
];

export class DingTalkCard implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DingTalk Card',
		name: 'dingTalkCard',
		icon: { light: 'file:dingtalkCard.svg', dark: 'file:dingtalkCard.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		usableAsTool: true,
		description: 'Create, deliver, update and finalize DingTalk interactive cards',
		defaults: { name: 'DingTalk Card' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{ name: 'dingTalkCardApi', required: true, testedBy: 'dingTalkCardCredentialTest' },
		],
		properties,
	};

	methods = {
		credentialTest: {
			async dingTalkCardCredentialTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted<ICredentialDataDecryptedObject>,
			): Promise<INodeCredentialTestResult> {
				try {
					const data = credential.data ?? {};
					const client = createClient(
						async (options) =>
							// ICredentialTestFunctions exposes only request in n8n-workflow 2.44.2.
							// eslint-disable-next-line @n8n/community-nodes/no-deprecated-workflow-functions -- Official custom credential-test context has no httpRequest helper.
							await this.helpers.request({
								method: options.method,
								uri: options.url,
								body: options.body,
								headers: options.headers,
								json: true,
								timeout: 30000,
								followRedirect: false,
							}),
						data.appKey as string,
						data.appSecret as string,
					);
					await client.test();
					return {
						status: 'OK',
						message:
							'Enterprise app token acquired. Card permissions and template access still need verification.',
					};
				} catch {
					return {
						status: 'Error',
						message:
							'Unable to acquire an enterprise app token. Check Client ID, Client Secret and network access to api.dingtalk.com.',
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];
		const credential = await this.getCredentials('dingTalkCardApi');
		let api: ReturnType<typeof createClient>;
		try {
			api = createClient(
				(options) => this.helpers.httpRequest(options),
				credential.appKey as string,
				credential.appSecret as string,
			);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Configure Client ID and Client Secret in the DingTalk Card API credential.',
			);
		}
		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as Operation;
			let body: Json = {};
			let autoFinalizeContent: string | undefined;
			try {
				if (this.getNodeParameter('inputMode', i) === 'json')
					body = jsonObject(this.getNodeParameter('requestBody', i), 'Request Body');
				else {
					body.outTrackId = this.getNodeParameter('outTrackId', i);
					if (operations.includes(operation)) {
						const cardDataMode = this.getNodeParameter('cardDataMode', i);
						body.cardData = cardDataMode === 'json'
							? jsonObject(this.getNodeParameter('cardData', i), 'Card Data')
							: cardDataMode === 'presentation'
								? presentationCardData(
										jsonObject(this.getNodeParameter('presentationDescriptor', i), 'Presentation Descriptor'),
									)
								: cardDataMode === 'a2ui'
									? a2uiCardData(jsonObject(this.getNodeParameter('a2uiDescriptor', i), 'A2UI Descriptor'))
								: formCardData(
										this.getNodeParameter('cardParameters.parameters', i, []) as Array<{
											name: string;
											value: string;
												valueMode?: string;
										}>,
									);
						if (cardDataMode === 'a2ui') {
							const descriptor = jsonObject(this.getNodeParameter('a2uiDescriptor', i), 'A2UI Descriptor');
							if (descriptor.version === '2' && descriptor.profile === 'universal-v2') {
								if (operation === 'update') {
									// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown -- Pure validation is converted to NodeOperationError at the item boundary.
									throw new CardError('A2UI universal-v2 uses the AI streaming lifecycle and is Create & Deliver only. Use Streaming Update or Finalize for an existing card.');
								}
								const map = (body.cardData as { cardParamMap?: Record<string, string> }).cardParamMap;
								if (!map?.content) {
									// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown -- Pure validation is converted to NodeOperationError at the item boundary.
									throw new CardError('A2UI universal-v2 must render non-empty Markdown content.');
								}
								autoFinalizeContent = map.content;
								map.content = '';
							}
						}
						if (operation === 'createAndDeliver') {
							body.cardTemplateId = this.getNodeParameter('cardTemplateId', i);
							const enableStreamCallbacks = this.getNodeParameter('enableStreamCallbacks', i, false);
							const a2uiMap = (body.cardData as { cardParamMap?: Record<string, string> }).cardParamMap;
							if (cardDataMode === 'a2ui' && a2uiMap?.a2uiActionVisible === 'true' && enableStreamCallbacks !== true) {
								// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown -- Pure validation is converted to NodeOperationError at the item boundary.
								throw new CardError('A2UI request actions require Enable Stream Callbacks on Create & Deliver.');
							}
							if (enableStreamCallbacks)
								body.callbackType = 'STREAM';
							const group = this.getNodeParameter('target', i) === 'group';
							const spaceId = this.getNodeParameter('spaceId', i) as string;
							const robotCodeOverride = this.getNodeParameter('robotCode', i, '') as string;
							const robotCode = robotCodeOverride.trim()
								? robotCodeOverride
								: (credential.appKey as string);
							if (!spaceId.trim()) {
								// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown -- Pure input validation is converted to NodeOperationError at the item boundary.
								throw new CardError('Space ID must be non-empty.');
							}
							body.openSpaceId = `dtv1.card//${group ? 'IM_GROUP' : 'IM_ROBOT'}.${spaceId}`;
							body[group ? 'imGroupOpenSpaceModel' : 'imRobotOpenSpaceModel'] = {
								supportForward: false,
							};
							body[group ? 'imGroupOpenDeliverModel' : 'imRobotOpenDeliverModel'] = group
								? { robotCode }
								: { robotCode, spaceType: 'IM_ROBOT' };
							body.userIdType = 1;
						} else
							body.cardUpdateOptions = {
								updateCardDataByKey: this.getNodeParameter('updateByKey', i),
							};
					} else {
						for (const field of ['key', 'content', 'guid', 'isFull', 'isError'])
							body[field] = this.getNodeParameter(field, i);
						if (operation === 'stream') body.isFinalize = this.getNodeParameter('isFinalize', i);
					}
				}
				const request = buildRequest(operation, body);
				body = request.body;
				const raw = await api(request.method, request.path, body);
				let streamRaw: unknown;
				if (operation === 'createAndDeliver' && autoFinalizeContent !== undefined) {
					const streamRequest = buildRequest('stream', {
						outTrackId: body.outTrackId,
						key: 'content',
						content: autoFinalizeContent,
						guid: '',
						isFull: true,
						isFinalize: true,
						isError: false,
					});
					streamRaw = await api(streamRequest.method, streamRequest.path, streamRequest.body);
				}
				// Raw API data is retained on success only; it contains no request credentials.
				output.push({
					json: {
						operation,
						outTrackId: body.outTrackId as string,
						...(body.guid ? { guid: body.guid as string } : {}),
						success: true,
						...(streamRaw === undefined ? {} : { streamFinalized: true }),
						correlation: { outTrackId: body.outTrackId as string, ...(body.guid ? { guid: body.guid as string } : {}) },
						raw: (streamRaw === undefined ? raw : { create: raw, stream: streamRaw }) as INodeExecutionData['json'],
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				const cardError = error instanceof CardError ? error : undefined;
				const message = cardError?.message ??
					'DingTalk Card could not process this item. Check parameter types and credential configuration.';
				const errorDetails: CardErrorDetails = cardError
					? {
							code: cardError.code,
							category: cardError.category,
							retryable: cardError.retryable,
							mayHaveSucceeded: cardError.mayHaveSucceeded,
							...(cardError.httpStatus === undefined ? {} : { httpStatus: cardError.httpStatus }),
							operation,
							phase: cardError.phase ?? 'request',
							attemptCount: cardError.attemptCount,
							ambiguousOutcome: cardError.ambiguousOutcome,
						}
					: {
							code: 'DINGTALK_ERROR',
							category: 'internal',
							retryable: false,
							mayHaveSucceeded: false,
							operation,
							phase: 'validation',
							attemptCount: 0,
							ambiguousOutcome: false,
						};
				const outTrackId = typeof body.outTrackId === 'string' ? body.outTrackId : '';
				if (this.continueOnFail()) {
					output.push({
						json: {
							operation,
							outTrackId,
							...(body.guid ? { guid: body.guid as string } : {}),
							correlation: { outTrackId, ...(body.guid ? { guid: body.guid as string } : {}) },
							success: false,
							error: message,
							errorDetails,
						},
						pairedItem: { item: i },
					});
				} else
					throw new NodeOperationError(this.getNode(), message, {
						itemIndex: i,
						description: `Operation: ${operation}. Phase: ${errorDetails.phase ?? 'request'}. Attempt count: ${errorDetails.attemptCount}. Error code: ${errorDetails.code}. Category: ${errorDetails.category}. Retryable: ${errorDetails.retryable}. Ambiguous outcome: ${errorDetails.ambiguousOutcome}. May have succeeded: ${errorDetails.mayHaveSucceeded}.${
							errorDetails.httpStatus === undefined
								? ''
								: ` HTTP status: ${errorDetails.httpStatus}.`
						} Out Track ID: ${outTrackId || '(not assigned)'}.${body.guid ? ` GUID: ${String(body.guid)}.` : ''} Preserve these identifiers when investigating partial delivery.`,
					});
			}
		}
		return [output];
	}
}
