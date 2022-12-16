<script setup lang="ts">
import { ref, toRefs, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHighLevelClientEmits } from '@/composables/emits'
import { useMessengerStore } from '@/stores/messenger'

const router = useRouter()

const clientEmits = useHighLevelClientEmits()
const messengerStore = useMessengerStore()

const { users, currentConversation, getNickname, authenticatedUsername } =
	toRefs(messengerStore)

const search = ref('')
const inputNewNickname = ref('')

const participantChangeNickname = ref('')

const isSearchInput = (username: string, searchInput: string): boolean => {
	if (search.value.length <= 0) return true
	return username.toLowerCase().includes(searchInput.toLowerCase())
}

const members = computed(() =>
	users.value.filter(
		(user) =>
			currentConversation.value?.participants.includes(user.username) &&
			isSearchInput(user.username, search.value)
	)
)
const community = computed(() =>
	users.value.filter(
		(user) =>
			!currentConversation.value?.participants.includes(user.username) &&
			isSearchInput(user.username, search.value)
	)
)

async function addParticipant(username: string): Promise<void> {
	const id = currentConversation.value?.id
	if (!id) return

	clientEmits.addParticipant(username, id)
}

async function removeParticipant(username: string): Promise<void> {
	const conv = currentConversation.value
	if (!conv) return
	if (conv.participants.length <= 3) return

	const id = conv.id
	clientEmits.removeParticipant(username, id)

	if (username === authenticatedUsername.value) {
		router.push({
			name: 'Community',
		})
	}
}

function updateNickname(): void {
	const id = currentConversation.value?.id
	if (!id) return

	clientEmits.setParticipantNicknameEmit(
		id,
		participantChangeNickname.value,
		inputNewNickname.value
	)
}

function resetNicknameValue(): void {
	inputNewNickname.value = ''
}
</script>

<template>
	<div class="group">
		<div class="ui fluid search">
			<div class="ui icon input">
				<input
					type="text"
					placeholder="Rechercher un utilisateur"
					class="prompt"
					v-model="search" />
				<i class="search icon"></i>
			</div>
		</div>
		<div class="spanner">
			<hr />
			<span>Participants</span>
			<hr />
		</div>
		<div class="user" v-for="member of members" :key="member.username">
			<img :src="member.picture_url" :alt="`Photo de ${member.username}`" />
			<span>
				{{ member.username }}
				<br />
				<i class="nickname">{{ getNickname(member.username) }}</i>
			</span>
			<i
				title="Modifier le surnom"
				class="circular quote left link icon"
				:class="{
					'concombre-tordu': member.username === authenticatedUsername,
				}"
				data-bs-toggle="modal"
				data-bs-target="#changeNicknameModal"
				@click="
					;[(participantChangeNickname = member.username), resetNicknameValue()]
				"></i>
			<i
				v-if="members.length > 3"
				@click="removeParticipant(member.username)"
				title="Enlever de la conversation"
				class="circular times icon link"
				:class="{
					'concombre-tordu': member.username === authenticatedUsername,
				}"
				style=""></i>
		</div>
		<div class="spanner">
			<hr />
			<span>Communauté</span>
			<hr />
		</div>
		<div class="user" v-for="member of community" :key="member.username">
			<img :src="member.picture_url" :alt="`Photo de ${member.username}`" />
			<span>{{ member.username }}</span>
			<i
				@click="addParticipant(member.username)"
				title="Ajouter à la conversation"
				class="circular plus icon link"></i>
		</div>
	</div>

	<div
		class="modal fade"
		id="changeNicknameModal"
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
						v-on:keyup.enter="updateNickname()"
						v-model="inputNewNickname"
						class="form-control"
						type="text"
						placeholder="Nouveau titre" />
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal">
						Close
					</button>
					<button
						type="button"
						class="btn btn-primary"
						@click="updateNickname()">
						Save changes
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped src="./Group.css" />
