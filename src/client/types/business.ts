export type Auth = {
	username: string
	token: string
	picture_url: string
}

export type User = {
	username: string
	picture_url: string
	awake: boolean
}

export interface ExtendedUser extends User {
	isOnline: boolean
	isMe: boolean
}

export type Message = {
	id: string
	from: string
	content: string | null
	posted_at: string
	delivered_to: Record<string, string>
	seen_by?: Record<string, string>
	reply_to: Message | null
	edited: boolean
	deleted: boolean
	reactions: Record<string, Reaction>
}

export interface ExtendedMessage extends Omit<Message, 'from'> {
	from: ExtendedUser
}

export interface UserSeen {
	user: User
	message_id: string
	time: string
	label: string
}

export type Conversation = {
	id: string
	type: 'one_to_one' | 'many_to_many'
	participants: string[]
	messages: Message[]
	title: string
	theme: Theme
	nicknames: Record<string, string>
	updated_at: string
	seen: Record<string, -1 | { message_id: string; time: string }>
	typing: Record<string, string>
}

export interface ExtendedConversation
	extends Omit<Conversation, 'messages' | 'seen'> {
	messages: ExtendedMessage[]
	users: User[]
	isOnline: boolean
	picture_url: string
	seen: UserSeen[]
}

export type Reaction = 'HEART' | 'THUMB' | 'HAPPY' | 'SAD'
export type Theme = 'BLUE' | 'RED' | 'RAINBOW'
