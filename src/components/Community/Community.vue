<script setup lang="ts">
import { toRefs, ref, computed } from 'vue'
import type { User } from '@/client/types/business'
import { useHighLevelClientEmits } from '@/composables/emits'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const clientEmits = useHighLevelClientEmits()

const { users } = toRefs(messengerStore)

const { availableUsernames, authenticatedUsername } = toRefs(messengerStore)

const searchInput = ref('')

const openingConversation = ref(false)

async function openConversation(users: User[]) {
	if (users.length === 0) return

	openingConversation.value = true

	if (users.length === 1) {
		await clientEmits.createOneToOneConversation(users[0].username)
	} else if (users.length > 1) {
		const names = users.map((user) => user.username)
		await clientEmits.createManyToManyConversation(names)
	}
}

const selectedUsers = ref<User[]>([])

function userIsSelected(user: User): boolean {
	return selectedUsers.value.includes(user)
}

function userIsOnLine(username: string): boolean {
	return availableUsernames.value.includes(username)
}

function toggleUser(user: User): void {
	if (user.username === authenticatedUsername.value) return
	if (userIsSelected(user)) {
		selectedUsers.value.splice(selectedUsers.value.indexOf(user), 1)
	} else {
		selectedUsers.value.push(user)
	}
}

const filteredUsers = computed(() =>
	users.value.filter((user) => {
		return user.username.toLowerCase().includes(searchInput.value.toLowerCase())
	})
)
</script>

<template>
	<div class="community">
		<div class="filter">
			<div class="ui fluid search">
				<div class="ui icon input">
					<input
						class="prompt"
						type="text"
						placeholder="Rechercher un utilisateur"
						v-model="searchInput" />
					<i class="search icon"></i>
				</div>
				<div class="results"></div>
			</div>
		</div>
		<div class="users">
			<div
				class="user"
				v-for="user in filteredUsers"
				:key="user.username"
				@click="toggleUser(user)"
				:class="{ selected: userIsSelected(user) }">
				<img :src="user.picture_url" :alt="`Photo de ${user.username}`" />
				<span :class="{ available: userIsOnLine(user.username) }">
					{{ user.username }}
				</span>
			</div>
		</div>

		<div class="actions">
			<button
				class="ui primary big button"
				@click="openConversation(selectedUsers)">
				<i class="conversation icon"></i>
				<span>
					{{
						openingConversation
							? `Ouverture de la conversation...`
							: `Ouvrir la conversation (${selectedUsers.length})`
					}}
				</span>
			</button>
		</div>
	</div>
</template>

<style scoped src="./Community.css" />
