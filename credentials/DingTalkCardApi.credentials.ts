import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DingTalkCardApi implements ICredentialType {
	name = 'dingTalkCardApi';
	displayName = 'DingTalk Card API';
	icon = {
		light: 'file:../nodes/DingTalkCard/dingtalkCard.svg',
		dark: 'file:../nodes/DingTalkCard/dingtalkCard.svg',
	} as const;
	documentationUrl = 'https://github.com/NTLx/n8n-nodes-dingtalk-card#credentials';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID / AppKey',
			name: 'appKey',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret / AppSecret',
			name: 'appSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}
