/* eslint-disable unused-imports/no-unused-vars */
import MetinetChatClient from './client'

function sleep(t) {
	return new Promise((resolve) => setTimeout(resolve, t))
}

async function main() {
	const alice = new MetinetChatClient('alice')
	const bob = new MetinetChatClient('bob')
	const charly = new MetinetChatClient('charly')
	const derek = new MetinetChatClient('derek')

	await alice.authenticate('alice', 'alice')
	await bob.authenticate('bob', 'bob')
	await charly.authenticate('charly', 'charly')
	await derek.authenticate('derek', 'derek')

	// bchazelle2.on('messagePosted', async ({ conversation_id, message_id, message_content}) => {
	//     console.log("bchazelle2@messagePosted", { conversation_id, message_id, message_content})
	//
	//     await bchazelle2.reactMessage(conversation_id, message_id, "HEART");
	//
	//
	//     await bchazelle2.replyMessage(conversation_id, message_id, "Bonjour le monde !");
	//
	//
	//
	// });

	// let y = await bchazelle.getUsers();

	// let { conversation_id } = await bchazelle.getOrCreateOneToOneConversation("bchazelle2");

	const c1 = await bob.createManyToManyConversation([
		'alice',
		'bob',
		'charly',
		'derek',
	])

	const m1 = await bob.postMessage(
		c1.conversation_id,
		'Hey Family ! Who is down to hang tonight ?!'
	)

	console.log({ m1 })

	await derek.seeMessage(c1.conversation_id, m1.message_id)

	const m2 = await derek.postMessage(
		c1.conversation_id,
		"*Let's gooo noww* :yeah:"
	)
	console.log({ m2 })

	await charly.seeMessage(c1.conversation_id, m1.message_id)
	await charly.seeMessage(c1.conversation_id, m2.message_id)

	const m3 = await charly.postMessage(c1.conversation_id, "I'm in !")
	console.log({ m3 })

	await bob.seeMessage(c1.conversation_id, m2.message_id)
	await bob.seeMessage(c1.conversation_id, m3.message_id)

	const m4 = await bob.postMessage(
		c1.conversation_id,
		'Great! What about Alice ?'
	)
	console.log({ m4 })

	await alice.seeMessage(c1.conversation_id, m1.message_id)
	await alice.seeMessage(c1.conversation_id, m2.message_id)
	await alice.seeMessage(c1.conversation_id, m3.message_id)
	await alice.seeMessage(c1.conversation_id, m4.message_id)

	const m5 = await alice.replyMessage(
		c1.conversation_id,
		m4.message_id,
		'I am!'
	)
	console.log({ m5 })

	await bob.seeMessage(c1.conversation_id, m5.message_id)

	const m6 = await bob.postMessage(c1.conversation_id, 'Yerp. Lve you !')
	console.log({ m6 })

	await bob.editMessage(c1.conversation_id, m6.message_id, 'Yerp. Love you !')

	await alice.seeMessage(c1.conversation_id, m6.message_id)

	await alice.reactMessage(c1.conversation_id, m6.message_id, 'HEART')

	await derek.reactMessage(c1.conversation_id, m6.message_id, 'THUMB')

	await derek.seeMessage(c1.conversation_id, m2.message_id)
	await derek.seeMessage(c1.conversation_id, m3.message_id)
	await derek.seeMessage(c1.conversation_id, m4.message_id)
	await derek.seeMessage(c1.conversation_id, m5.message_id)
	await derek.seeMessage(c1.conversation_id, m6.message_id)

	const m7 = await derek.postMessage(
		c1.conversation_id,
		"What's about Charly ?"
	)
	console.log({ m7 })

	await derek.deleteMessage(c1.conversation_id, m7.message_id)

	console.log('END')

	const c2 = await alice.getOrCreateOneToOneConversation('bob')

	const m10 = await alice.postMessage(
		c2.conversation_id,
		'So happy to see you again !'
	)

	await bob.reactMessage(c2.conversation_id, m10.message_id, 'HEART')

	const m11 = await bob.replyMessage(
		c2.conversation_id,
		m10.message_id,
		'Me too ! :smile:'
	)

	// console.log(JSON.stringify(await bchazelle.getConversations(), null, 4))

	// console.log("search", JSON.stringify(await bchazelle.searchMessage("hello"), null, 4))
}

main()
