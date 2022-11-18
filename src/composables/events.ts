/* eslint-disable unused-imports/no-unused-vars */
import type {
	ConversationCreatedEvent,
	ConversationSeenEvent,
	ConversationThemeSetEvent,
	ConversationTitleSetEvent,
	ConversationTypedEvent,
	MessageDeletedEvent,
	MessageDeliveredEvent,
	MessageEditedEvent,
	MessagePostedEvent,
	MessageReactedEvent,
	ParticipantAddedEvent,
	ParticipantNicknameSetEvent,
	ParticipantRemovedEvent,
	UserCreatedEvent,
	UsersAvailableEvent,
} from '@/client/types/events'
import { useLowLevelClient } from '@/client/useLowLevelClient'
import { useMessengerStore } from '@/stores/messenger'

export function listenHighLevelClientEvents() {
	const chatClient = useLowLevelClient()

	const messengerStore = useMessengerStore()

	chatClient.on<UserCreatedEvent>('@userCreated', async ({ user }) => {
		messengerStore.upsertUser(user)
	})

	chatClient.on<ConversationCreatedEvent>(
		'@conversationCreated',
		async ({ conversation }) => {
			messengerStore.upsertConversation(conversation)
		}
	)

	chatClient.on<ParticipantAddedEvent>(
		'@participantAdded',
		async ({ conversation }) => {
			messengerStore.upsertConversation(conversation)
		}
	)

	chatClient.on<ParticipantRemovedEvent>(
		'@participantRemoved',
		async ({ conversation }) => {
			messengerStore.upsertConversation(conversation)
		}
	)

	chatClient.on<MessagePostedEvent>(
		'@messagePosted',
		async ({ conversation_id, message }) => {
			messengerStore.upsertMessageConversation(conversation_id, message)
		}
	)

	chatClient.on<MessageDeliveredEvent>(
		'@messageDelivered',
		async ({ conversation_id, message }) => {
			//TODO
		}
	)

	chatClient.on<ConversationSeenEvent>(
		'@conversationSeen',
		async ({ conversation }) => {
			messengerStore.upsertConversation(conversation)
		}
	)

	chatClient.on<MessageReactedEvent>(
		'@messageReacted',
		async ({ conversation_id, message }) => {
			messengerStore.upsertMessageConversation(conversation_id, message)
		}
	)

	chatClient.on<MessageEditedEvent>(
		'@messageEdited',
		async ({ conversation_id, message }) => {
			messengerStore.upsertMessageConversation(conversation_id, message)
		}
	)

	chatClient.on<MessageDeletedEvent>(
		'@messageDeleted',
		async ({ conversation_id, message_id }) => {
			messengerStore.upsertDeletedMessageConversation(
				conversation_id,
				message_id
			)
		}
	)

	chatClient.on<UsersAvailableEvent>(
		'@usersAvailable',
		async ({ usernames }) => {
			messengerStore.upsertUsersAvailable(usernames)
		}
	)

	chatClient.on<ConversationTypedEvent>(
		'@conversationTyped',
		async ({ conversation_id, username, date }) => {
			messengerStore.upsertConversationTyped(conversation_id, username, date)
		}
	)

	chatClient.on<ConversationThemeSetEvent>(
		'@conversationThemeSet',
		async ({ conversation_id, theme }) => {
			messengerStore.upsertConversationTheme(conversation_id, theme)
		}
	)

	chatClient.on<ConversationTitleSetEvent>(
		'@conversationTitleSet',
		async ({ conversation_id, title }) => {
			//TODO
		}
	)

	chatClient.on<ParticipantNicknameSetEvent>(
		'@participantNicknameSet',
		async ({ conversation_id, participant, nickname }) => {
			messengerStore.upsertConversationNickname(
				conversation_id,
				participant,
				nickname
			)
		}
	)
}
