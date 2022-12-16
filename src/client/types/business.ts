export type Auth = {
	username: string
	token: string
	picture_url: string
}

export type User = {
	username: string
	picture_url: string
	awake: boolean

	// Front only
	isOnline: boolean
	isMe: boolean
}

export type Conversation = {
	id: string
	type: 'one_to_one' | 'many_to_many'
	participants: string[]
	messages: Message[]
	title: string | null
	theme: Theme
	nicknames: Record<string, string>
	updated_at: string
	seen: Record<string, -1 | { message_id: string; time: string }>
	typing: Record<string, string>

	// Front only
	users: User[]
	isOnline: boolean
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

export type Reaction = 'HEART' | 'THUMB' | 'HAPPY' | 'SAD'
export type Theme = 'BLUE' | 'RED' | 'RAINBOW'
