<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import type {
	Conversation,
	Message as MessageType,
} from '@/client/types/business'
import Group from '@/components/Group/Group.vue'
import Message from '@/components/Message/Message.vue'
import { useHighLevelClientEmits } from '@/composables/emits'
import { useMessengerStore } from '@/stores/messenger'

const clientEmits = useHighLevelClientEmits()

const groupPanel = ref(false)

const isEditMessage = ref(false)

const idMessageToEdit = ref('')

const scrollElement = ref<HTMLElement | null>(null)

const messengerStore = useMessengerStore()

const { users, currentConversation, authenticatedUsername } =
	toRefs(messengerStore)

const router = useRouter()

const inputSentMessage = ref('');

const messages = computed(() => {
	return currentConversation.value?.messages ?? []
})

watch(messages, () => {
	if (!currentConversation.value || !messages.value) return
	clientEmits.SeeConversationEmit(
		currentConversation.value.id,
		messages.value[messages.value.length - 1].id
	)
})

async function sendMessage(): Promise<void> {
	if (!currentConversation.value) return

	if (isEditMessage.value) {
		editMessage()
		return
	}

	const temp = inputSentMessage.value
	if (replyMessage.value.user !== '') {
		await clientEmits.replyMessage(
			currentConversation.value.id,
			replyMessage.value.messageId,
			String(temp)
		)
		replyToMessage('', '', '')
	} else {
		await clientEmits.postMessage(currentConversation.value.id, String(temp))
	}
	inputSentMessage.value = ''
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
})

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
		return `Groupe: ${conversation.participants.join(', ')}`
	}

	const participant = conversation.participants.find(
		(participant) => participant !== authenticatedUsername.value
	)

	if (participant) {
		return participant
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
		return 'https://yt3.ggpht.com/JliOszS4fXEpCIs2it_vsBjwhlNWgZsboezGA7NYUtihf8F54A5I7laaj2d3zpH-io6e2fVL=s900-c-k-c0x00ffffff-no-rj' // Mmmmmh
	}

	return user.picture_url
}

function convertStringToDate(date: string): Date {
	return new Date(date)
}

function reactMessage($event: {
	message: typeof Message
	react: 'HEART' | 'THUMB' | 'HAPPY' | 'SAD'
}): void {
	if (!currentConversation.value) return
	clientEmits.reactMessage(
		$event.message.id,
		$event.react,
		currentConversation.value.id
	)
}

const replyMessage = ref({
	user: '',
	content: '',
	messageId: '',
})

function replyToMessage(
	user: string,
	content: string | null,
	messageId: string
) {
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
	const c =
		computed(() => {
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
		}).value ?? 'middle'
	console.log(c, message.from)
	return c
}

const messageSeen = (messageID: string) =>
	computed(() => {
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
	}).value
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

				<span v-else data-v-73baddaf="">
					<i data-v-73baddaf="" class="avatar users icon"></i>
				</span>
			</a>

			<div class="title">
				<div class="ui compact">
					<i class="icon circle"></i>
					<span v-if="currentConversation">
						{{ titleConversation(currentConversation) }}
					</span>
					<div class="ui simple dropdown item">
						<i class="vertical ellipsis icon"></i>

						<div class="menu">
							<div v-if="true" class="item">
								<i class="ui icon paint brush"></i>
								Modifier le thème
							</div>
							<div v-if="true" class="item">
								<i class="ui icon edit"></i>
								Modifier le titre
							</div>
							<div v-if="true" class="item">
								<i class="ui icon volume bell slash"></i>
								Mettre en sourdine
							</div>
							<div v-if="true" class="item">
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
		</div>

		<div class="conversation-container">
			<div class="conversation-main">
				<div class="conversation-body" ref="scrollElement">
					<div class="wrapper">
						<div
							class="message-container"
							v-for="message in messages"
							:key="message.id">
							<div class="time">
								{{
									convertStringToDate(message.posted_at).toLocaleTimeString()
								}}
							</div>
							<Message
								:message="message"
								:url-icon="getProfilePicture(message.from)"
								:class="getClass(message, messages)"
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
									:title="`Vu par ${view.user} à ${convertStringToDate(
										view.time
									).toLocaleTimeString()}`"
									alt="view" />
							</div>
						</div>
					</div>
				</div>

				<div class="typing">
					<div class="wrapper">Alice est en train d'écrire...</div>
				</div>
				<div class="conversation-footer">
					<div class="wrapper">
						<p v-if="replyMessage.user !== ''">
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
									v-on:keyup.enter="sendMessage()"
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

			<div>
				<search/>
			</div>
		</div>
	</div>
</template>

<style scoped src="./Conversation.css" />
