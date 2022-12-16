<script setup lang="ts">
import { toRefs } from 'vue'
import type { ExtendedUser, ParticipantInfo } from '@/client/types/business'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const { currentConversation } = toRefs(messengerStore)

const conversation = currentConversation.value

if (!conversation) throw new Error('CurrentConversation is undefined')

const date = new Date(conversation.updated_at)

const participants: ParticipantInfo[] = conversation.users.map(
	(participant: ExtendedUser) => {
		const seen = conversation.seenUser.find(
			(_seen) => _seen.user.username === participant.username
		)
		if (!seen) throw new Error('Participant seen is undefined')
		return {
			name: participant.username,
			nickname: conversation.nicknames[participant.username] ?? '-',
			numberOfMessages: (() =>
				conversation.messagesExtend.filter(
					(message) => message.from === participant.username
				).length ?? 0)(),
			seen,
		}
	}
)
</script>

<template>
	<div class="group-information">
		<div class="group-information-header">
			<img
				v-if="conversation.participants.length < 3"
				:src="conversation.picture_url"
				:alt="`Photo de Conversation #${conversation.id}`"
				class="avatar" />
			<span v-else>
				<i class="avatar users icon"></i>
			</span>
			<h1>{{ conversation.title }}</h1>
		</div>

		<div class="group-information-container">
			<p>Last message on {{ date.toLocaleDateString() }}</p>
			<h2>Participants</h2>

			<table aria-describedby="conversation informations">
				<tr>
					<th>Name</th>
					<th>Nickname</th>
					<th>Date of last message</th>
					<th>Number of messages</th>
				</tr>
				<tr v-for="participant in participants" :key="participant.name">
					<td>{{ participant.name }}</td>
					<td>{{ participant.nickname }}</td>
					<td>
						{{ `${new Date(participant.seen.time).toLocaleString()}` }}
					</td>
					<td>{{ participant.numberOfMessages }}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style scoped src="./GroupInformation.css" />
