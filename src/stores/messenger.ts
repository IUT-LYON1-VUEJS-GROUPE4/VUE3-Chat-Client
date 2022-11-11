import { defineStore } from 'pinia'
import { ref, computed, toRefs } from 'vue'
import type { Conversation, Message, User } from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'

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
		usersRef.value.map((user) => {
			return {
				...user,
			}
		})
	)

	const conversations = computed(() =>
		conversationsRef.value.map((conversation) => {
			return {
				...conversation,
			}
		})
	)

	const currentConversation = computed(() => {
		return conversationsRef.value.find(
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

	/**
	 * **ManyToMany Conversation**
	 *
	 * Current conversation participants are authenticated
	 *
	 * Need only one participant online to return true
	 */
	const participantsAreOnline = computed((): boolean => {
		if (!currentConversation.value) return false
		if (currentConversation.value.participants.length > 2) {
			const allMember = currentConversationParticipants.value

			for (let i = 0; i < allMember.length; i++) {
				if (availableUsernames.value.includes(allMember[i])) return true
			}

			return false
		} else
			return availableUsernames.value.includes(
				currentConversation.value.participants[1]
			)
	})

	return {
		authenticatedUsername,
		users,
		availableUsernames,
		conversations,
		currentConversation,
		currentConversationParticipants,
		participantsAreOnline,
		setConversations,
		setCurrentConversationId,
		setUsers,
		upsertUser,
		upsertConversation,
		upsertMessageConversation,
		upsertDeletedMessageConversation,
		upsertUsersAvailable,
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

	function upsertMessageConversation(conversationId: string, message: Message) {
		const conversationIndex = conversationsRef.value.findIndex(
			(_conversation) => _conversation.id === conversationId
		)

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
				conversationsRef.value[conversationIndex].messages.splice(
					messageIndex,
					1
				)
			}
		}
	}

	function upsertUsersAvailable(usernames: string[]) {
		availableUsernames.value = usernames
	}
})
