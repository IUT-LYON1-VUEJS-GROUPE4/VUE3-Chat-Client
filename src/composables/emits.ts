import { useRouter } from 'vue-router'
import type {
	CreateManyToManyConversationEmit,
	GetConversationsEmit,
	GetOrCreateOneToOneConversationEmit,
	GetUsersEmit,
	PostMessageEmit,
	AddParticipantEmit,
	RemoveParticipantEmit,
	ReactMessageEmit,
	ReplyMessageEmit,
	DeleteMessageEmit,
	EditMessageEmit,
	SeeConversationEmit,
	TypeConversationEmit,
	SetConversationThemeEmit,
} from '@/client/types/emits'
import { useLowLevelClient } from '@/client/useLowLevelClient'
import { useMessengerStore } from '@/stores/messenger'

export function useHighLevelClientEmits() {
	const chatClient = useLowLevelClient()

	const messengerStore = useMessengerStore()

	const router = useRouter()

	return {
		async getUsers() {
			const { users } = await chatClient.emit<GetUsersEmit>('@getUsers', {})
			messengerStore.setUsers(users)
		},

		async postMessage(converastionId: string, message: string) {
			await chatClient.emit<PostMessageEmit>('@postMessage', {
				conversation_id: converastionId,
				content: String(message),
			})
		},

		async getConversations() {
			const { conversations } = await chatClient.emit<GetConversationsEmit>(
				'@getConversations',
				{}
			)
			messengerStore.setConversations(conversations)
		},

		async editMessage(
			converastionId: string,
			messageId: string,
			content: string
		) {
			await chatClient.emit<EditMessageEmit>('@editMessage', {
				conversation_id: converastionId,
				message_id: messageId,
				content: content,
			})
		},

		async createOneToOneConversation(username: string) {
			const response =
				await chatClient.emit<GetOrCreateOneToOneConversationEmit>(
					'@getOrCreateOneToOneConversation',
					{ username }
				)

			const { conversation } = response

			messengerStore.upsertConversation(conversation)

			router.push({
				name: 'Conversation',
				params: { id: conversation.id },
			})

			return response
		},

		async createManyToManyConversation(usernames: string[]) {
			const response = await chatClient.emit<CreateManyToManyConversationEmit>(
				'@createManyToManyConversation',
				{ usernames }
			)

			const { conversation } = response

			messengerStore.upsertConversation(conversation)

			router.push({
				name: 'Conversation',
				params: { id: conversation.id },
			})

			return response
		},

		async addParticipant(username: string, conversationID: string) {
			const response = await chatClient.emit<AddParticipantEmit>(
				'@addParticipant',
				{
					conversation_id: conversationID,
					username: username,
				}
			)
			return response
		},

		async removeParticipant(username: string, conversationID: string) {
			const response = await chatClient.emit<RemoveParticipantEmit>(
				'@removeParticipant',
				{
					conversation_id: conversationID,
					username: username,
				}
			)
			return response
		},

		async reactMessage(
			messageID: string,
			react: 'HEART' | 'THUMB' | 'HAPPY' | 'SAD',
			conversationID: string
		) {
			const response = await chatClient.emit<ReactMessageEmit>(
				'@reactMessage',
				{
					conversation_id: conversationID,
					message_id: messageID,
					reaction: react,
				}
			)
			return response
		},

		async replyMessage(
			conversationId: string,
			messageId: string,
			message: string
		) {
			const response = await chatClient.emit<ReplyMessageEmit>(
				'@replyMessage',
				{
					conversation_id: conversationId,
					message_id: messageId,
					content: message,
				}
			)
			return response
		},

		async deleteMessage(conversationId: string, messageId: string) {
			const response = await chatClient.emit<DeleteMessageEmit>(
				'@deleteMessage',
				{
					conversation_id: conversationId,
					message_id: messageId,
				}
			)
			return response
		},

		async SeeConversationEmit(conversationId: string, messageId: string) {
			const response = await chatClient.emit<SeeConversationEmit>(
				'@seeConversation',
				{
					conversation_id: conversationId,
					message_id: messageId,
				}
			)
			return response
		},

		async TypeConversationEmit(conversationId: string) {
			const response = await chatClient.emit<TypeConversationEmit>(
				'@typeConversation',
				{
					conversation_id: conversationId,
				}
			)
			return response
		},

		async setConversationTheme(
			conversationId: string,
			theme: 'BLUE' | 'RED' | 'RAINBOW'
		) {
			const response = await chatClient.emit<SetConversationThemeEmit>(
				'@setConversationTheme',
				{
					conversation_id: conversationId,
					theme: theme,
				}
			)
			return response
		},
	}
}
