<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import type {
	Conversation,
	Message as MessageType,
} from '@/client/types/business'

import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const { conversations, users, authenticatedUsername } = toRefs(messengerStore)

const searchInput = ref('');

const authStore = useAuthStore()

const { user } = toRefs(authStore)


function displayMessage(){
	console.log(searchInput.value);
	if(searchInput.value.length < 4){
		return;
	}
	console.log(conversations.value)
}

const filteredConversation = computed(() =>
	{
		//Créer un nouveau tableau de conversation
		//Supprimer tous les messages dans des conversation, puis les conversation et mettre dans le tableau retourné
		return conversations;
		/*conversations.value.filter((user) => {
			return user.username.toLowerCase().includes(searchInput.value.toLowerCase())
		})*/
	}
	
)


</script>

<template>
	<div class="search-message">
		<div class="filter">
			<div class="ui fluid search">
				<div class="ui icon input">
					<input
						v-on:keyup="displayMessage()"
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
			
			<div class="conversation" v-for="conversation in conversations" :key="conversation.id">
				
				<div class="author">
	
					<img src="" /><!-- Image du groupe / profil -->
					<span>{{conversation.type==="many_to_many"
						? conversation.participants 
						: conversation.participants[0] === user?.username ? conversation.participants[1] : conversation.participants[0] }}</span><!-- Nom de conv -->
					
				</div>

				<div class="messages" v-for="message in conversation.messages" :key="message.id">
				
						<div class="time">COUCOU</div> <!-- Heure / date -->
						<div class="bubble"> <!-- Message -->
							{{message.content}}
						</div>
					
				</div>

				<!-- <Message
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
							<div class="view"> -->
			</div>
		</div>
	</div>
</template>

<style scoped src="./Search.css" />
