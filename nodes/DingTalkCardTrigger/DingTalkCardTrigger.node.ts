import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { CardError } from '../DingTalkCard/transport';
import { createCardStream } from './stream';
import { DingTalkCard } from '../DingTalkCard/DingTalkCard.node';

export class DingTalkCardTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DingTalk Card Trigger',
		name: 'dingTalkCardTrigger',
		icon: {
			light: 'file:../DingTalkCard/dingtalkCard.svg',
			dark: 'file:../DingTalkCard/dingtalkCard.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: 'Card interactions',
		description: 'Receive DingTalk card interactions over Stream',
		defaults: { name: 'DingTalk Card Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{ name: 'dingTalkCardApi', required: true, testedBy: 'dingTalkCardCredentialTest' },
		],
		properties: [
			{
				displayName:
					'Create cards with STREAM callbacks using the same Client ID. Only one Stream service per Client ID. Callbacks are acknowledged immediately; workflow updates are asynchronous.',
				name: 'streamNotice',
				type: 'notice',
				default: '',
			},
		],
	};

	methods = new DingTalkCard().methods;

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credential = await this.getCredentials('dingTalkCardApi');
		try {
			const stream = createCardStream(credential.appKey as string, credential.appSecret as string, {
				request: (options) => this.helpers.httpRequest(options),
				emit: (item) => this.emit([[{ json: item as INodeExecutionData['json'] }]]),
				warn: (message) => this.logger.warn(message),
			});
			// Return cleanup immediately so n8n can deactivate even during the gateway request.
			stream.start();
			return { closeFunction: async () => stream.stop() };
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				error instanceof CardError ? error.message : 'DingTalk Card Stream could not start.',
			);
		}
	}
}
