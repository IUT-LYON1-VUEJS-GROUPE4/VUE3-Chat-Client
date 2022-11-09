<script setup lang="ts">
import { toRefs, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Conversation } from '@/client/types/business'
import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'

const router = useRouter()

const authStore = useAuthStore()

const messengerStore = useMessengerStore()

const { user } = toRefs(authStore)
const { logout } = authStore

const searchInput = ref('')

const { conversations, users, availableUsernames, authenticatedUsername } =
	toRefs(messengerStore)

const conversationSelectedId = ref('')

function openCommunity() {
	router.push({ name: 'Community' })
}

function openMessageSearch() {
	router.push({ name: 'Search' })
}

function openConversation(id: Conversation['id']) {
	conversationSelectedId.value = id
	router.push({ name: 'Conversation', params: { id } })
}

const filteredConversations = computed(() => {
	if (searchInput.value === '') return sortConversations(conversations.value)

	const conversationsResult: Conversation[] = []

	conversations.value.map((conversation: Conversation) => {
		let alreadyFounded = false
		for (let i = 0; i < conversation.participants.length; i++) {
			if (
				conversation.participants[i]
					.toLowerCase()
					.includes(searchInput.value.toLowerCase())
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

function convertStringToDate(date: string): Date {
	return new Date(date)
}

function getProfilePicture(participants: string[]): string {
	const username = participants.find(
		(participant) => participant !== authenticatedUsername.value
	)
	const user = users.value.find((user) => user.username === username)
	if (!user) {
		return 'https://yt3.ggpht.com/JliOszS4fXEpCIs2it_vsBjwhlNWgZsboezGA7NYUtihf8F54A5I7laaj2d3zpH-io6e2fVL=s900-c-k-c0x00ffffff-no-rj' // Mmmmmh
	}

	return user.picture_url
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

function userIsOnLine(conversation: Conversation): boolean {
	if (conversation.participants.length > 2) {
		let returnState = false

		conversation.participants.forEach((participant) => {
			if (availableUsernames.value.includes(participant)) {
				returnState = true
			}
		})

		return returnState
	} else {
		return availableUsernames.value.includes(conversation.participants[1])
	}
}

function sortConversations(conversations: Conversation[]): Conversation[] {
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
					selected: conversation.id === conversationSelectedId,
					new:
						authenticatedUsername &&
						!Object.keys(conversation.seen).includes(authenticatedUsername),
				}"
				:key="conversation.id"
				:title="titleConversation(conversation)"
				@click="openConversation(conversation.id)">
				<a class="avatar">
					<img
						v-if="conversation.participants.length < 3"
						:src="getProfilePicture(conversation.participants)"
						:alt="`Photo de Conversation #${conversation.id}`" />
					<span v-else data-v-73baddaf="">
						<i data-v-73baddaf="" class="users icon"></i>
					</span>
				</a>
				<div class="content">
					<div class="metadata">
						<div class="title">
							<i
								v-if="userIsOnLine(conversation)"
								class="ui small icon circle green"></i>
							{{ titleConversation(conversation) }}
						</div>
						<span class="time">
							{{
								conversation.messages.length === 0
									? convertStringToDate(
											conversation.updated_at
									  ).toLocaleDateString()
									: convertStringToDate(
											conversation.messages[conversation.messages.length - 1]
												.posted_at
									  ).toLocaleDateString()
							}}
						</span>
					</div>
					<div class="metadata">
						<div class="text">
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
									? convertStringToDate(
											conversation.updated_at
									  ).toLocaleTimeString()
									: convertStringToDate(
											conversation.messages[conversation.messages.length - 1]
												.posted_at
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
