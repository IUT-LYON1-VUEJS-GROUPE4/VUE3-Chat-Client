<script setup lang="ts">
import { toRefs } from 'vue'
import { useMessengerStore } from '@/stores/messenger'
import type { UserSeen } from '@/client/types/business';

const messengerStore = useMessengerStore()

const { currentConversation } = toRefs(messengerStore)

const conversation = currentConversation.value

if (!conversation) throw new Error('CurrentConversation is undefined')

const date = new Date(conversation.updated_at)

const participants: {
	name: string
	nickname: string | undefined
	numberOfMessages: number
	seen: -1 | { message_id: string; time: string }
}[] = conversation.participants.map((participant: string) => {
	let nickname: string = '-'
	let seen: UserSeen
	let numberOfMessages: number = 0

	if (conversation.nicknames[participant])
		nickname = conversation.nicknames[participant]

    // const seen = conversation.seen.find(_seen = )
	// if () {
	// 	seen = conversation.seen[participant]
	// }

	if (
		conversation.messages.find(
			(message) => message.from.username === participant
		)
	) {
		numberOfMessages = conversation.messages.filter(
			(message) => message.from.username === participant
		).length
	}

	return {
		name: participant,
		nickname: nickname,
		numberOfMessages: numberOfMessages,
		seen: {},
	}
})
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
						{{
							participant.seen === -1
								? '-'
								: `${new Date(participant.seen.time).toLocaleString()}`
						}}
					</td>
					<td>{{ participant.numberOfMessages }}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style scoped src="./GroupInformation.css" />
