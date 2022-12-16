<script setup lang="ts">
import { toRefs, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ExtendedConversation } from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'

const router = useRouter()

const authStore = useAuthStore()

const messengerStore = useMessengerStore()

const { user } = toRefs(authStore)
const { logout } = authStore

const searchInput = ref('')

const { conversations, authenticatedUsername, currentConversation } =
	toRefs(messengerStore)

function openCommunity() {
	router.push({ name: 'Community' })
}

function openMessageSearch() {
	router.push({ name: 'Search' })
}

function openConversation(id: ExtendedConversation['id']) {
	router.push({ name: 'Conversation', params: { id } })
}

const filteredConversations = computed(() => {
	if (searchInput.value === '') return sortConversations(conversations.value)

	const conversationsResult: ExtendedConversation[] = []

	conversations.value.forEach((conversation: ExtendedConversation) => {
		let alreadyFounded = false
		for (const participants in conversation.participants) {
			if (
				participants.toLowerCase().includes(searchInput.value.toLowerCase())
			) {
				conversationsResult.push(conversation)
				alreadyFounded = true
				break
			}
		}

		if (!alreadyFounded) {
			if (conversation.title) {
				if (conversation.title.includes(searchInput.value)) {
					conversationsResult.push(conversation)
				}
			}
		}
	})

	return sortConversations(conversationsResult)
})

function sortConversations(
	conversations: ExtendedConversation[]
): ExtendedConversation[] {
	return conversations.sort((a, b) =>
		(b.messages.length === 0
			? b.updated_at
			: b.messages[b.messages.length - 1].posted_at
		).localeCompare(
			a.messages.length === 0
				? a.updated_at
				: a.messages[a.messages.length - 1].posted_at
		)
	)
}

function conversationClassNewConditions(
	conversation: ExtendedConversation
): boolean {
	return (
		(authenticatedUsername.value &&
			conversation.seen[String(authenticatedUsername.value)] === -1) ||
		Object(conversation.seen[String(authenticatedUsername.value)])
			?.message_id !==
			conversation.messages[conversation.messages.length - 1].id
	)
}
</script>

<template>
	<div class="sidebar">
		<div class="user" v-if="user">
			<div class="user-picture">
				<img
					:src="user.picture_url"
					class="ui circular image"
					:alt="`Photo de ${user.username}`" />
			</div>

			<div class="user-info">
				<div class="user-info-pseudo">{{ user.username }}</div>

				<div class="user-info-status ui simple dropdown">
					<div class="available text">En ligne</div>
					<i class="dropdown icon"></i>
					<div class="menu">
						<div class="item" @click="logout">
							<i class="logout icon"></i>
							Déconnexion
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="menu">
			<div class="blue button" @click="openCommunity">
				<i class="users icon"></i>
				<br />
				<span>Communauté</span>
			</div>
			<div v-if="true" class="blue button" @click="openMessageSearch">
				<i class="search icon"></i>
				<br />
				<span>Messages</span>
			</div>
		</div>
		<div class="conversations">
			<div class="conversation-search">
				<div class="ui fluid search">
					<div class="ui icon input">
						<input
							class="prompt"
							placeholder="Rechercher une conversation"
							type="text"
							v-model="searchInput" />
						<i class="search icon"></i>
					</div>
				</div>
			</div>

			<div
				v-for="conversation in filteredConversations"
				class="conversation"
				:class="{
					selected: conversation.id === currentConversation?.id,
					new: conversationClassNewConditions(conversation),
					available: conversation.isOnline,
				}"
				:key="conversation.id"
				:title="conversation.title"
				@click="openConversation(conversation.id)">
				<a class="avatar">
					<img
						v-if="conversation.participants.length < 3"
						:src="conversation.picture_url"
						:alt="`Photo de ExtendedConversation #${conversation.id}`" />
					<span v-else>
						<i
							class="users icon"
							:class="{ new: conversation.messages.length === 0 }"></i>
					</span>
				</a>
				<div class="content">
					<div class="metadata">
						<div class="title">
							<i
								v-if="conversation.isOnline"
								class="ui small icon circle green"></i>
							{{ conversation.title }}
						</div>
						<span class="time">
							{{
								conversation.messages.length === 0
									? new Date(conversation.updated_at).toLocaleDateString()
									: new Date(
											conversation.messages[
												conversation.messages.length - 1
											].posted_at
									  ).toLocaleDateString()
							}}
						</span>
					</div>
					<div class="metadata">
						<div
							:class="{
								'new-conv': conversation.messages.length === 0,
								text: conversation.messages.length > 0,
							}">
							{{
								conversation.messages.length === 0
									? 'Nouvelle conversation'
									: conversation.messages[conversation.messages.length - 1]
											.content
							}}
						</div>

						<span class="time">
							{{
								conversation.messages.length === 0
									? new Date(conversation.updated_at).toLocaleTimeString()
									: new Date(
											conversation.messages[
												conversation.messages.length - 1
											].posted_at
									  ).toLocaleTimeString()
							}}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped src="./Sidebar.css" />
