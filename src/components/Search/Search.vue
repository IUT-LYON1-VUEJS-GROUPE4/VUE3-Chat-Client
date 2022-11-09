<script setup lang="ts">
import { ref, toRefs } from 'vue'
import type { Conversation } from '@/client/types/business'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const { conversations, users, authenticatedUsername } = toRefs(messengerStore)

const searchInput = ref('')

function filteredMessage(conv: Conversation) {
	return conv.messages.filter((mess) => {
		return mess.content?.toLowerCase().includes(searchInput.value.toLowerCase())
	})
}

function convertStringToDate(date: string): Date {
	return new Date(date)
}
</script>

<template>
	<div class="search-message">
		<div class="filter">
			<div class="ui fluid search">
				<div class="ui icon input">
					<input
						v-model="searchInput"
						class="prompt"
						type="text"
						placeholder="Rechercher un message" />
					<i class="search icon"></i>
				</div>
				<div class="results"></div>
			</div>
		</div>

		<div class="conversations">
			<div
				class="conversation"
				v-for="conversation in conversations"
				:key="conversation.id">
				<div v-if="filteredMessage(conversation).length !== 0">
					<div v-if="conversation.type === 'many_to_many'">
						<div class="author">
							<div class="avatar">
								<span data-v-73baddaf="">
									<i data-v-73baddaf="" class="users icon"></i>
								</span>
							</div>

							<span>
								Groupe :
								{{
									JSON.stringify(conversation.participants)
										.replace('[', '')
										.replace(']', '')
								}}
							</span>
						</div>

						<div
							v-for="message in filteredMessage(conversation)"
							:key="message.id">
							<div
								:class="
									message.from === authenticatedUsername
										? 'message mine'
										: 'message'
								">
								<div
									:class="
										message.from === authenticatedUsername
											? 'time mine'
											: 'time'
									">
									{{
										convertStringToDate(conversation.updated_at)
											.toLocaleString()
											.substring(0, 16)
									}}
								</div>
								<div class="bubble">
									{{ message.content }}
								</div>
							</div>
						</div>
					</div>

					<div v-else>
						<div class="author">
							<img
								class="img-profil-search"
								:src="
									conversation.participants[0] === authenticatedUsername
										? users.find(
												(item) => item.username === conversation.participants[1]
										  )?.picture_url
										: users.find(
												(item) => item.username === conversation.participants[0]
										  )?.picture_url
								" />
							<span>
								{{
									conversation.participants[0] === authenticatedUsername
										? conversation.participants[1]
										: conversation.participants[0]
								}}
							</span>
						</div>

						<div
							v-for="message in filteredMessage(conversation)"
							:key="message.id">
							<div
								:class="
									message.from === authenticatedUsername
										? 'message mine'
										: 'message'
								">
								<div
									:class="
										message.from === authenticatedUsername
											? 'time mine'
											: 'time'
									">
									{{
										convertStringToDate(conversation.updated_at)
											.toLocaleString()
											.substring(0, 16)
									}}
								</div>
								<div class="bubble">
									{{ message.content }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped src="./Search.css" />
