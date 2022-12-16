<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import type {
	Conversation,
	Message as MessageType,
	Reaction,
	Theme,
} from '@/client/types/business'
import Group from '@/components/Group/Group.vue'
import Message from '@/components/Message/Message.vue'
import { useHighLevelClientEmits } from '@/composables/emits'
import { DEFAULT_PROFILE_PICTURE } from '@/constants'
import { useMessengerStore } from '@/stores/messenger'

const clientEmits = useHighLevelClientEmits()

const groupPanel = ref(false)

const isEditMessage = ref(false)

const idMessageToEdit = ref('')

const scrollElement = ref<HTMLElement | null>(null)

const messengerStore = useMessengerStore()

const {
	users,
	currentConversation,
	authenticatedUsername,
	currentConversationParticipants,
	getNickname,
} = toRefs(messengerStore)

const router = useRouter()

const inputSentMessage = ref('')
const inputNewTitle = ref('')

const messages = computed(() => {
	return currentConversation.value?.messages ?? []
})

const typingEvent = () => {
	if (!currentConversation.value) return

	clientEmits.TypeConversationEmit(currentConversation.value.id)
}

const isReplyMessage = ref(false)
const replyMessage = ref({
	user: '',
	content: '',
	messageId: '',
})

async function sendMessage(): Promise<void> {
	if (!currentConversation.value) return

	if (isEditMessage.value) {
		editMessage()
		return
	}

	const message = inputSentMessage.value
	inputSentMessage.value = ''
	if (isReplyMessage.value) {
		await clientEmits.replyMessage(
			currentConversation.value.id,
			replyMessage.value.messageId,
			message
		)
		updateSeenMessage()
		isReplyMessage.value = false
	} else {
		await clientEmits.postMessage(currentConversation.value.id, message)
	}
}

async function enterEditMode(
	messageId: string,
	messageContent: string
): Promise<void> {
	isEditMessage.value = true
	inputSentMessage.value = messageContent
	idMessageToEdit.value = messageId
}

async function editMessage(): Promise<void> {
	if (!currentConversation.value) return
	await clientEmits.editMessage(
		currentConversation.value.id,
		idMessageToEdit.value,
		inputSentMessage.value
	)
	exitEditMode()
}

function exitEditMode() {
	isEditMessage.value = false
	inputSentMessage.value = ''
}

function openGroupInformation(): void {
	router.push({
		name: 'GroupInformation',
		params: { id: currentConversation.value?.id },
	})
}

onMounted(() => {
	scrollBottom()
})

onUpdated(() => {
	scrollBottom()
})

watch(currentConversation, (/*newConversation, oldConversation*/) => {
	scrollBottom()
	updateSeenMessage()
})

function updateSeenMessage() {
	if (
		!currentConversation.value ||
		!messages.value ||
		!authenticatedUsername.value
	)
		return
	const messageId = messages.value[messages.value.length - 1]?.id
	const userSeen = currentConversation.value.seen[authenticatedUsername.value]
	if (userSeen === -1 || !messageId) return
	if (
		Object(currentConversation.value.seen[String(authenticatedUsername.value)])
			.message_id !== messageId
	) {
		clientEmits.SeeConversationEmit(currentConversation.value.id, messageId)
	}
}

function scrollBottom() {
	setTimeout(() => {
		if (scrollElement.value) {
			scrollElement.value.scrollTop = scrollElement.value.scrollHeight
		}
	}, 0)
}

function titleConversation(conversation: Conversation): string {
	if (conversation.title) return conversation.title

	if (conversation.participants.length > 2) {
		return `Groupe: ${currentConversationParticipants.value.join(', ')}`
	}

	const user = conversation.users.find((user) => !user.isMe)

	if (user) {
		return user.username
	}

	return 'Anonymous'
}

function getProfilePicture(participants: string[] | string): string {
	let username: string | undefined
	if (Array.isArray(participants)) {
		username = participants.find(
			(participant: string) => participant !== authenticatedUsername.value
		)
	} else {
		username = participants
	}

	const user = users.value.find((user) => user.username === username)
	if (!user) {
		return DEFAULT_PROFILE_PICTURE
	}

	return user.picture_url
}

function reactMessage($event: {
	message: typeof Message
	react: Reaction
}): void {
	if (!currentConversation.value) return
	clientEmits.reactMessage(
		$event.message.id,
		$event.react,
		currentConversation.value.id
	)
}

function replyToMessage(
	user: string,
	content: string | null,
	messageId: string
) {
	isReplyMessage.value = true
	replyMessage.value = {
		user: user,
		content: content === null ? '' : content,
		messageId: messageId,
	}
}

async function deleteMessage(messageId: string): Promise<void> {
	if (!currentConversation.value) return

	await clientEmits.deleteMessage(currentConversation.value.id, messageId)
}

function getClass(message: MessageType, messages: MessageType[]): string {
	let c =
		(() => {
			const index = messages.findIndex((_message) => _message.id === message.id)
			const previousMessage = messages[index - 1]
			const nextMessage = messages[index + 1]

			let result = 'top bottom'

			if (
				nextMessage &&
				nextMessage.from === message.from &&
				(!previousMessage || previousMessage.from !== message.from)
			)
				result = 'top'
			else if (
				previousMessage &&
				previousMessage.from === message.from &&
				(!nextMessage || nextMessage.from !== message.from)
			)
				result = 'bottom'
			else if (
				previousMessage &&
				nextMessage &&
				previousMessage.from === message.from &&
				nextMessage.from === message.from
			)
				result = 'middle'
			return result
		})() ?? 'middle'

	if (currentConversation.value?.theme === 'BLUE') {
		c += ' blue'
	} else if (currentConversation.value?.theme === 'RED') {
		c += ' red'
	} else {
		c += ' rainbow'
	}

	return c
}

const messageSeen = (messageID: string) => {
	if (!currentConversation.value) return []
	const views = currentConversation.value.seen
	const viewArray: {
		id: number
		user: string
		message_id: string
		time: string
	}[] = []
	let id = 0
	for (const view in views) {
		const value = views[view]
		if (value === -1 || value.message_id !== messageID) continue
		viewArray.push({ id: id++, user: view, ...value })
	}
	return viewArray
}

const timeRef = ref(new Date())

setInterval(() => (timeRef.value = new Date()), 1000)

const usersWriting = computed(() => {
	return Object.entries(currentConversation.value?.typing || {})
		.filter(([username]) => username !== authenticatedUsername.value)
		.filter(function (value) {
			const dateString = value[1]
			const now = timeRef.value.getTime()
			const delayInSeconds = now - 10 * 1000

			const lastActivityDate = new Date(dateString).getTime()

			return delayInSeconds < lastActivityDate
		})
		.map((array) => array[0])
		.join(', ')
})

function updateTitle(): void {
	if (!currentConversation.value) return

	clientEmits.SetConversationTitleEmit(
		currentConversation.value.id,
		inputNewTitle.value
	)
}

function updateTheme(id: string | undefined, theme: Theme): void {
	if (!id) return
	clientEmits.setConversationTheme(id, theme)
}

function themeSelected(theme: Theme): boolean {
	return currentConversation.value?.theme === theme
}

function muteConversation(): void {
	if (!currentConversation.value) return

	let conversationsMute = []

	const json = localStorage.getItem('conversationMuteId')

	if (json == null) {
		conversationsMute.push(currentConversation.value.id)
	} else {
		conversationsMute = JSON.parse(json)
		if (!conversationsMute.includes(currentConversation.value.id)) {
			conversationsMute.push(currentConversation.value.id)
		}
	}

	localStorage.setItem('conversationMuteId', JSON.stringify(conversationsMute))
}

function unmuteConversation(): void {
	const json = localStorage.getItem('conversationMuteId')

	if (json == null || !currentConversation.value) return
	const conversationsMute = JSON.parse(json)
	if (conversationsMute.includes(currentConversation.value.id)) {
		const index = conversationsMute.indexOf(currentConversation.value.id)
		conversationsMute.splice(index, 1)
	}
	localStorage.setItem('conversationMuteId', JSON.stringify(conversationsMute))
}

function isMuteConversation(): boolean {
	const json = localStorage.getItem('conversationMuteId')
	if (json == null || !currentConversation.value) return false
	const conversationsMute = JSON.parse(json)

	return !!conversationsMute.includes(currentConversation.value.id)
}

function getViewerNickname(nickname: string): string {
	if (nickname !== '') return ' (' + nickname + ')'
	else return ''
}

function resetConvTitleValue(): void {
	inputNewTitle.value = ''
}

/**
 * Returns true if the targeted message was sent after less than 10 minutes than the previous one.
 */
const isShortTime = (message: MessageType, messages: MessageType[]) => {
	return computed((): boolean => {
		const index = messages.findIndex((_message) => _message.id === message.id)
		if (!messages[index - 1]) return true
		if (messages[index - 1].from !== message.from) return true

		return (
			new Date(messages[index - 1].posted_at).getTime() + 600000 <
			new Date(message.posted_at).getTime()
		)
	}).value
}
updateSeenMessage()
</script>

<template>
	<div class="conversation">
		<div class="conversation-header">
			<a @click="openGroupInformation">
				<img
					v-if="
						currentConversation && currentConversation.participants.length < 3
					"
					:src="getProfilePicture(currentConversation.participants)"
					class="avatar"
					alt="Group photo" />

				<span v-else>
					<i class="avatar users icon"></i>
				</span>
			</a>

			<div class="title">
				<div class="ui compact">
					<i
						v-if="currentConversation"
						:class="{
							'icon circle': currentConversation.isOnline,
						}"></i>
					<span v-if="currentConversation">
						{{ titleConversation(currentConversation) }}
						<br />
						<i class="nickname">
							{{ getNickname(titleConversation(currentConversation)) }}
						</i>
					</span>
				</div>

				<div class="ui simple dropdown item">
					<i class="vertical ellipsis icon"></i>

					<div class="menu">
						<div
							v-if="true"
							class="item"
							data-bs-toggle="modal"
							data-bs-target="#changeThemeModal">
							<i class="ui icon paint brush"></i>
							Modifier le thème
						</div>
						<div
							v-if="
								currentConversation?.participants.length &&
								currentConversation.participants.length > 2
							"
							class="item"
							data-bs-toggle="modal"
							data-bs-target="#changeTitleModal"
							@click="resetConvTitleValue()">
							<i class="ui icon edit"></i>
							Modifier le titre
						</div>
						<div
							v-if="!isMuteConversation()"
							class="item"
							@click="muteConversation()">
							<i class="ui icon volume bell slash"></i>
							Mettre en sourdine
						</div>
						<div
							v-if="isMuteConversation()"
							class="item"
							@click="unmuteConversation()">
							<i class="ui icon volume bell"></i>
							Rétablir les notifications
						</div>
						<div class="item" @click="groupPanel = !groupPanel">
							<i class="ui icon users"></i>
							Gérer les participants
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conversation-container">
			<div class="conversation-main">
				<div class="conversation-body" ref="scrollElement">
					<div class="wrapper">
						<div
							class="message-container"
							v-for="message in messages"
							:key="message.id">
							<div v-if="isShortTime(message, messages)" class="time">
								{{ new Date(message.posted_at).toLocaleTimeString() }}
							</div>
							<Message
								:message="message"
								:url-icon="getProfilePicture(message.from)"
								:class="getClass(message, messages)"
								:nickname="getNickname(message.from)"
								@react="reactMessage($event)"
								@reply-to-message="
									replyToMessage(message.from, message.content, message.id)
								"
								@delete-message="deleteMessage(message.id)"
								@edit-message="
									enterEditMode(message.id, String(message.content))
								" />
							<div class="view">
								<img
									v-for="view of messageSeen(message.id)"
									:key="view.id"
									:src="getProfilePicture(view.user)"
									:title="`Vu par ${view.user}${getViewerNickname(
										getNickname(view.user)
									)} à ${new Date(view.time).toLocaleTimeString()}`"
									alt="view" />
							</div>
						</div>
					</div>
				</div>

				<div class="typing" v-if="currentConversation">
					<div class="wrapper" v-if="usersWriting">
						{{ usersWriting }} est en train d'écrire...
					</div>
				</div>
				<div class="conversation-footer">
					<div class="wrapper">
						<p v-if="isReplyMessage">
							<i title="Abandonner" class="circular times small icon link"></i>
							Répondre à {{ replyMessage.user }} :
							<span>{{ replyMessage.content }}</span>
						</p>

						<div class="ui fluid search">
							<div class="ui icon input">
								<div v-if="isEditMessage">
									<i
										title="Retour"
										class="circular cancel icon"
										@click="exitEditMode()"></i>
									<p>Edition</p>
								</div>
								<input
									v-on:keyup="typingEvent"
									v-on:keyup.enter="sendMessage"
									v-model="inputSentMessage"
									class="prompt"
									type="text"
									placeholder="Rédiger un message" />
								<i @click="sendMessage()" class="send icon"></i>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="conversation-sidebar" v-if="groupPanel">
				<Group />
			</div>
		</div>
	</div>

	<div
		class="modal fade"
		id="changeTitleModal"
		tabindex="-1"
		aria-labelledby="exampleModalLabel"
		aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="exampleModalLabel">
						Modifier le nom de la conversation
					</h1>
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<input
						v-on:keyup.enter="updateTitle()"
						v-model="inputNewTitle"
						class="form-control"
						type="text"
						placeholder="Nouveau titre" />
					<small class="sub-text">
						Laisser le champs vide pour réinitialiser le titre de la
						conversation
					</small>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal">
						Close
					</button>
					<button type="button" class="btn btn-primary" @click="updateTitle()">
						Save changes
					</button>
				</div>
			</div>
		</div>
	</div>

	<div
		class="modal fade"
		id="changeThemeModal"
		tabindex="-1"
		aria-labelledby="staticBackdropLabel"
		aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="staticBackdropLabel">
						Changer le thème
					</h1>
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body d-flex justify-content-around">
					<div
						@click="updateTheme(currentConversation?.id, 'BLUE')"
						class="circle-theme blue"
						:class="{
							'theme-selected': themeSelected('BLUE'),
						}"></div>
					<div
						@click="updateTheme(currentConversation?.id, 'RED')"
						class="circle-theme red"
						:class="{
							'theme-selected': themeSelected('RED'),
						}"></div>
					<div
						@click="updateTheme(currentConversation?.id, 'RAINBOW')"
						class="circle-theme rainbow"
						:class="{
							'theme-selected': themeSelected('RAINBOW'),
						}"></div>
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal">
						Fermer
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped src="./Conversation.css" />
