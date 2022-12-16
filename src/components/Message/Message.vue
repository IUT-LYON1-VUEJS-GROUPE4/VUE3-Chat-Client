<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import reacts from '@/assets/reacts.json'
import { useAuthStore } from '@/stores/auth'
import type { ExtendedMessage } from '../../client/types/business'

const ps = defineProps<{
	message: ExtendedMessage
	class: string
	nickname?: string
}>()

const emit = defineEmits([
	'react',
	'reply-to-message',
	'delete-message',
	'edit-message',
])

const props = ref(ps)

const authStore = useAuthStore()
const { user } = toRefs(authStore)

function getReactData(_key: string) {
	return reacts.find((data) => data.key === _key)
}

const reactions = computed(() => {
	const map = new Map<string, number>()

	const reacts = props.value.message.reactions
	for (const userID in reacts) {
		const value = map.get(reacts[userID]) ?? 0
		map.set(reacts[userID], value + 1)
	}
	return map
})

const reactMessage = (react: string): void => {
	if (
		!user.value ||
		(react !== 'HEART' &&
			react !== 'THUMB' &&
			react !== 'HAPPY' &&
			react !== 'SAD')
	)
		return

	emit('react', { message: props.value.message, react: react })
}

const titleNickName = computed(() => {
	if (props.value.nickname) return `(${props.value.nickname})`
	return ''
})

const replyToMessage = () => emit('reply-to-message')
const deleteMessage = () => emit('delete-message')
const editMessage = () => emit('edit-message')
</script>

<template>
	<div v-if="props.message.from.isMe" class="message mine">
		<div class="bubble" :class="props.class">
			<p
				v-if="props.message.reply_to"
				class="reply_content"
				:class="{
					'message-deleted': props.message.reply_to.deleted,
				}">
				{{
					props.message.reply_to.deleted
						? 'Message supprimé'
						: props.message.reply_to.content
				}}
			</p>
			<p :class="{ 'message-deleted': props.message.deleted }">
				{{ props.message.deleted ? 'Message supprimé' : props.message.content }}
			</p>
		</div>
		<div class="reacts">
			<span v-for="react in reactions" :key="react[0]" class="circular icon">
				{{ react[1] }}
				<i
					:title="getReactData(react[0])?.label"
					:class="getReactData(react[0])?.iconClass"
					class="outline icon"></i>
			</span>
		</div>
		<div v-if="!message.deleted" class="controls">
			<i
				title="Supprimer"
				class="circular trash icon"
				@click="deleteMessage()"></i>
			<i title="Editer" class="circular edit icon" @click="editMessage()"></i>
			<i
				title="Répondre"
				class="circular reply icon"
				@click="replyToMessage()"></i>
		</div>
	</div>
	<div v-else class="message">
		<img
			v-if="
				props.class.includes('bottom') || props.class.includes('top bottom')
			"
			:title="`${props.message.from} ${titleNickName}`"
			:src="props.message.from.picture_url"
			:alt="props.message.from.username" />
		<div class="bubble" :class="props.class">
			<p v-if="props.message.reply_to" class="reply_content">
				{{
					props.message.reply_to.deleted
						? 'Message supprimé'
						: props.message.reply_to.content
				}}
			</p>
			<p :class="{ 'message-deleted': props.message.deleted }">
				{{ props.message.deleted ? 'Message supprimé' : props.message.content }}
			</p>
		</div>
		<div class="reacts">
			<span v-for="react in reactions" :key="react[0]" class="circular icon">
				{{ react[1] }}
				<i
					:title="getReactData(react[0])?.label"
					:class="getReactData(react[0])?.iconClass"
					class="outline icon"></i>
			</span>
		</div>
		<div v-if="!message.deleted" class="controls">
			<i
				title="Répondre"
				class="circular reply icon"
				@click="replyToMessage()"></i>
			<span class="react">
				<i
					class="circular outline icon"
					v-for="react of reacts"
					:key="react.key"
					:title="react.label"
					:class="react.iconClass"
					@click="reactMessage(react.key)"></i>
			</span>
		</div>
	</div>
</template>

<style scoped src="./Message.css" />
