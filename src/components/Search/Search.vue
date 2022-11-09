<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import type {
	Conversation,
	Message,
	Message as MessageType,
} from '@/client/types/business'

import { useAuthStore } from '@/stores/auth'
import { useMessengerStore } from '@/stores/messenger'

const messengerStore = useMessengerStore()

const { conversations, users, authenticatedUsername } = toRefs(messengerStore)

const searchInput = ref('');

const authStore = useAuthStore()

const conversationsRef = ref<Conversation[]>([])

const { user } = toRefs(authStore)


function filteredMessage(conv:Conversation){
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
			
			<div class="conversation" v-for="conversation in conversations" :key="conversation.id">
				
				<div v-if="filteredMessage(conversation).length!== 0">
				
				<div v-if="conversation.type==='many_to_many'">

					<div class="author">
						<div class="avatar">
							<span data-v-73baddaf="">
							<i data-v-73baddaf="" class="users icon"></i>
							</span>
						</div>
						
						<span>
							Groupe : {{ JSON.stringify(conversation.participants).replace('[','').replace(']','')}}
						</span>
					</div>

					<div  v-for="message in filteredMessage(conversation)" :key="message.id">
						<div  v-bind:class="message.from === user?.username ? 'message mine':'message'" >
							<div  v-bind:class="message.from === user?.username ? 'time mine':'time'">
								{{convertStringToDate(conversation.updated_at).toLocaleString().substring(0,16)}}
								</div>
							<div class="bubble"> 
								{{message.content}}
							</div>
						</div>
					</div>
				</div>

				<div v-else>
					<div class="author">
						
						<img 
							class="img-profil-search" 
							:src="conversation.participants[0] === user?.username 
							? users.find(item => item.username === conversation.participants[1])?.picture_url
							: users.find(item => item.username === conversation.participants[0])?.picture_url " />
						<span>
							{{conversation.participants[0] === user?.username ? conversation.participants[1] : conversation.participants[0]}}
						</span>
					</div>

					<div  v-for="message in filteredMessage(conversation)" :key="message.id">
						<div  v-bind:class="message.from === user?.username ? 'message mine':'message'" >
							<div  v-bind:class="message.from === user?.username ? 'time mine':'time'"> 
								
								{{convertStringToDate(conversation.updated_at).toLocaleString().substring(0,16)}} 
							</div>
							<div class="bubble"> 
								{{message.content}}
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
