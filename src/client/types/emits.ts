/* eslint-disable @typescript-eslint/ban-types */
import type {
	Auth,
	Conversation,
	Message,
	Reaction,
	User,
} from '@/client/types/business'

export interface Emit {
	event: string
	authenticated: boolean
	payload: object
	response: object
}

export interface AuthenticateEmit extends Emit {
	event: '@authenticate'
	authenticated: false
	payload: {
		username: string
		password: string
	}
	response: Auth
}

export interface GetUsersEmit extends Emit {
	event: '@getUsers'
	authenticated: true
	payload: {}
	response: {
		users: User[]
	}
}

export interface GetOrCreateOneToOneConversationEmit extends Emit {
	event: '@getOrCreateOneToOneConversation'
	authenticated: true
	payload: {
		username: string
	}
	response: {
		conversation: Conversation
	}
}

export interface CreateManyToManyConversationEmit extends Emit {
	event: '@createManyToManyConversation'
	authenticated: true
	payload: {
		usernames: string[]
	}
	response: {
		conversation: Conversation
	}
}

export interface PostMessageEmit extends Emit {
	event: '@postMessage'
	authenticated: true
	payload: {
		conversation_id: string
		content: string
	}
	response: {
		message: Message
	}
}

export interface SeeConversationEmit extends Emit {
	event: '@seeConversation'
	authenticated: true
	payload: {
		conversation_id: string
		message_id: string
	}
	response: {}
}

export interface ReactMessageEmit extends Emit {
	event: '@reactMessage'
	authenticated: true
	payload: {
		conversation_id: string
		message_id: string
		reaction: Reaction
	}
	response: {}
}

export interface ReplyMessageEmit extends Emit {
	event: '@replyMessage'
	authenticated: true
	payload: {
		conversation_id: string
		message_id: string
		content: string
	}
	response: {
		message: Message
	}
}

export interface GetConversationsEmit extends Emit {
	event: '@getConversations'
	authenticated: true
	payload: {}
	response: {
		conversations: Conversation[]
	}
}

export interface SearchMessageEmit extends Emit {
	event: '@searchMessage'
	authenticated: true
	payload: {
		search: string
	}
	response: {
		conversations: Conversation[]
	}
}

export interface EditMessageEmit extends Emit {
	event: '@editMessage'
	authenticated: true
	payload: {
		conversation_id: string
		message_id: string
		content: string
	}
	response: {}
}

export interface DeleteMessageEmit extends Emit {
	event: '@deleteMessage'
	authenticated: true
	payload: {
		conversation_id: string
		message_id: string
	}
	response: {}
}

export interface AddParticipantEmit extends Emit {
	event: '@addParticipant'
	authenticated: true
	payload: {
		conversation_id: string
		username: string
	}
	response: {
		conversation: Conversation
	}
}

export interface RemoveParticipantEmit extends Emit {
	event: '@removeParticipant'
	authenticated: true
	payload: {
		conversation_id: string
		username: string
	}
	response: {
		conversation: Conversation
	}
}

export interface TypeConversationEmit extends Emit {
	event: '@typeConversation'
	authenticated: true
	payload: {
		conversation_id: string
	}
	response: {
		conversation: Conversation
	}
}

export interface SetConversationThemeEmit extends Emit {
	event: '@setConversationTheme'
	authenticated: true
	payload: {
		conversation_id: string
		theme: string
	}
	response: {
		conversation: Conversation
	}
}

export interface SetConversationTitleEmit extends Emit {
	event: '@setConversationTitle'
	authenticated: true
	payload: {
		conversation_id: string
		title: string
	}
	response: {
		conversation: Conversation
	}
}

export interface SetParticipantNicknameEmit extends Emit {
	event: '@setParticipantNickname'
	authenticated: true
	payload: {
		conversation_id: string
		participant: string
		nickname: string
	}
	response: {
		conversation: Conversation
	}
}
