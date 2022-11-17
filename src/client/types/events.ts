import type { Conversation, Message, User } from '@/client/types/business'

export interface Event {
	event: string
	payload: unknown
}

export interface UserCreatedEvent extends Event {
	event: '@userCreated'
	payload: {
		user: User
	}
}

export interface ConversationCreatedEvent extends Event {
	event: '@conversationCreated'
	payload: {
		conversation: Conversation
	}
}

export interface ParticipantAddedEvent extends Event {
	event: '@participantAdded'
	payload: {
		conversation: Conversation
	}
}

export interface ParticipantRemovedEvent extends Event {
	event: '@participantRemoved'
	payload: {
		conversation: Conversation
	}
}

export interface MessagePostedEvent extends Event {
	event: '@messagePosted'
	payload: {
		conversation_id: string
		message: Message
	}
}

export interface MessageDeliveredEvent extends Event {
	event: '@messageDelivered'
	payload: {
		conversation_id: string
		message: Message
	}
}

export interface ConversationSeenEvent extends Event {
	event: '@conversationSeen'
	payload: {
		conversation: Conversation
	}
}

export interface MessageReactedEvent extends Event {
	event: '@messageReacted'
	payload: {
		conversation_id: string
		message: Message
	}
}

export interface MessageEditedEvent extends Event {
	event: '@messageEdited'
	payload: {
		conversation_id: string
		message: Message
	}
}

export interface MessageDeletedEvent extends Event {
	event: '@messageDeleted'
	payload: {
		conversation_id: string
		message_id: string
	}
}

export interface UsersAvailableEvent extends Event {
	event: '@usersAvailable'
	payload: {
		usernames: string[]
	}
}

export interface ConversationTypedEvent extends Event {
	event: '@conversationTyped'
	payload: {
		conversation_id: number
		username: string
		date: string
	}
}

export interface ConversationThemeSetEvent extends Event {
	event: '@conversationThemeSet'
	payload: {
		conversation_id: string
		theme: 'BLUE' | 'RED' | 'RAINBOW'
	}
}

export interface ConversationTitleSetEvent extends Event {
	event: '@conversationTitleSet'
	payload: {
		conversation_id: string
		title: string
	}
}

export interface ParticipantNicknameSetEvent extends Event {
	event: '@participantNicknameSet'
	payload: {
		conversation_id: string
		participant: string
		nickname: string
	}
}
