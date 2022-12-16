import { defineStore } from 'pinia'
import { ref, computed, toRefs } from 'vue'
import {
	DEFAULT_NOTIFY_SOUND,
	DEFAULT_PROFILE_PICTURE,
} from '@/assets/constants'
import type {
	Conversation,
	ExtendedMessage,
	Message,
	Theme,
	User,
	UserSeen,
} from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'
import type {
	ExtendedConversation,
	ExtendedUser,
} from '../client/types/business'

function getConversationTitle(
	conversation: Conversation,
	usersConversation: ExtendedUser[]
): string {
	if (conversation.title) return conversation.title

	if (conversation.participants.length > 2) {
		return `Groupe: ${conversation.participants.join(', ')}`
	}

	const user = usersConversation.find((user) => !user.isMe)
	if (user) return user.username
	return 'Anonymous'
}

function getConversationPictureUrl(
	conversation: Conversation,
	usersConversation: ExtendedUser[]
): string {
	if (conversation.type === 'one_to_one') {
		return (
			usersConversation.find((_user) => !_user.isMe)?.picture_url ??
			DEFAULT_PROFILE_PICTURE
		)
	}

	return DEFAULT_PROFILE_PICTURE
}

function getConversationSeenUser(
	conversation: Conversation,
	usersConversation: ExtendedUser[]
): UserSeen[] {
	const seenArray: UserSeen[] = []
	for (const username in conversation.seen) {
		const see = conversation.seen[username]
		if (typeof see === 'number') continue
		const userSee = <User>(
			usersConversation.find((_user) => username === _user.username)
		)
		const nickname = conversation.nicknames[userSee.username]
		seenArray.push({
			user: userSee,
			message_id: see?.message_id ?? null,
			time: see.time,
			label: `Vu par ${userSee.username} - ${nickname ?? '?'} à ${new Date(
				see.time
			).toLocaleTimeString()}`,
		})
	}
	return seenArray
}

export const useMessengerStore = defineStore('messenger', () => {
	const authStore = useAuthStore()

	const { user: userRef } = toRefs(authStore)

	// State

	const usersRef = ref<User[]>([])

	const availableUsernames = ref<string[]>([])

	const conversationsRef = ref<Conversation[]>([])

	const currentConversationId = ref<string | null>(null)

	// Getters

	const authenticatedUsername = computed(() => userRef.value?.username || null)

	const users = computed(() =>
		usersRef.value.map((user): ExtendedUser => {
			return {
				...user,
				isOnline: availableUsernames.value.includes(user.username),
				isMe: user.username === authenticatedUsername.value,
			}
		})
	)

	const conversations = computed(() =>
		conversationsRef.value.map(
			(conversation: Conversation): ExtendedConversation => {
				const usersConversation = users.value.filter((_user: User) =>
					conversation.participants.includes(_user.username)
				)
				return {
					...conversation,
					users: usersConversation,
					isOnline: usersConversation.some(
						(_user) => _user.isOnline && !_user.isMe
					),
					title: getConversationTitle(conversation, usersConversation),
					picture_url: getConversationPictureUrl(
						conversation,
						usersConversation
					),
					messagesExtend: conversation.messages.map(
						(message: Message): ExtendedMessage => {
							return {
								...message,
								fromUser: <ExtendedUser>(
									usersConversation.find(
										(_user) => _user.username === message.from
									)
								),
							}
						}
					),
					seenUser: getConversationSeenUser(conversation, usersConversation),
				}
			}
		)
	)

	const currentConversation = computed(() => {
		return conversations.value.find(
			(conversation) => conversation.id === currentConversationId.value
		)
	})

	/**
	 * All current conversation participants except the current client user
	 */
	const currentConversationParticipants = computed(
		() =>
			currentConversation.value?.participants.filter(
				(participant) => participant !== authenticatedUsername.value
			) ?? []
	)

	return {
		authenticatedUsername,
		users,
		availableUsernames,
		conversations,
		currentConversation,
		currentConversationParticipants,
		setConversations,
		setCurrentConversationId,
		setUsers,
		getNickname,
		upsertUser,
		upsertConversation,
		upsertMessageConversation,
		upsertDeletedMessageConversation,
		upsertUsersAvailable,
		upsertConversationTyped,
		upsertConversationTitle,
		upsertConversationTheme,
		upsertConversationNickname,
	}

	// Actions

	function setCurrentConversationId(conversationId: string | null) {
		currentConversationId.value = conversationId
	}

	function setUsers(users: User[]) {
		usersRef.value = users
	}

	function setConversations(conversations: Conversation[]) {
		conversationsRef.value = conversations
	}

	function getNickname(username: string): string {
		if (username.includes(',')) {
			const tab = username.substring(8).split(', ')
			const emptyString = '[aucun]'

			let stringReturn = ''
			tab.forEach((element) => {
				const nickname = getNickname(element)
				if (nickname !== '') stringReturn += nickname + ', '
				else stringReturn += emptyString + ', '
			})

			return 'Groupe: ' + stringReturn.substring(0, stringReturn.length - 2)
		} else {
			return Object.entries(currentConversation.value?.nicknames || {})
				.filter(([_username]) => _username === username)
				.map(([, nickname]) => nickname)
				.toString()
		}
	}

	function upsertUser(user: User) {
		const userIndex = usersRef.value.findIndex(
			(_user) => _user.username === user.username
		)

		if (userIndex !== -1) {
			usersRef.value[userIndex] = { ...user }
		} else {
			usersRef.value.push({ ...user })
		}
	}

	function upsertConversation(conversation: Conversation) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversation.id
		)

		if (conversationIndex !== -1) {
			const isParticipant = !!conversation.participants.find(
				(memberUserName) => memberUserName === authenticatedUsername.value
			)
			if (!isParticipant) {
				conversationsRef.value = conversationsRef.value.filter(
					(_conv) => _conv.id !== conversation.id
				)
			} else {
				conversationsRef.value[conversationIndex] = { ...conversation }
			}
		} else {
			conversationsRef.value.push({ ...conversation })
		}
	}

	function upsertMessageConversation(
		conversationId: string,
		message: Message,
		type: 'react' | 'edit' | 'send'
	) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversationId
		)

		if (currentConversation.value?.id !== conversationId && type === 'send') {
			const json = localStorage.getItem('conversationMuteId')
			let conversationsMute = []
			if (json != null) {
				conversationsMute = JSON.parse(json)
			}

			if (!conversationsMute.includes(conversationId)) {
				const audio = new Audio(DEFAULT_NOTIFY_SOUND)
				audio.play()
			}
		}

		if (conversationIndex !== -1) {
			const messageIndex = conversationsRef.value[
				conversationIndex
			].messages.findIndex((_message) => _message.id === message.id)

			if (messageIndex !== -1) {
				conversationsRef.value[conversationIndex].messages[messageIndex] =
					message
			} else {
				conversationsRef.value[conversationIndex].messages.push({
					...message,
				})
			}
		}
	}

	function upsertDeletedMessageConversation(
		conversationId: string,
		messageId: string
	) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversationId
		)

		if (conversationIndex !== -1) {
			const messageIndex = conversationsRef.value[
				conversationIndex
			].messages.findIndex((_message) => _message.id === messageId)

			if (messageIndex !== -1) {
				conversationsRef.value[conversationIndex].messages[
					messageIndex
				].deleted = true
			}
		}
	}

	function upsertUsersAvailable(usernames: string[]) {
		availableUsernames.value = usernames
	}

	function upsertConversationTyped(
		conversation_id: number,
		username: string,
		date: string
	) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversation_id.toString()
		)

		if (conversationIndex === -1) return

		const conversationTyping = conversationsRef.value[conversationIndex].typing

		conversationTyping[username] = date
	}

	function upsertConversationTitle(conversation_id: string, title: string) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversation_id
		)

		if (conversationIndex !== -1) {
			conversationsRef.value[conversationIndex].title = title
		}
	}

	function upsertConversationTheme(conversation_id: string, theme: Theme) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversation_id.toString()
		)

		if (conversationIndex !== -1) {
			conversationsRef.value[conversationIndex].theme = theme
		}
	}

	function upsertConversationNickname(
		conversation_id: string,
		participant: string,
		nickname: string
	) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversation_id.toString()
		)

		if (conversationIndex !== -1) {
			conversationsRef.value[conversationIndex].nicknames[participant] =
				nickname
		}
	}
})
