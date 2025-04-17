// index.js - BEN WHITTAKER TECH FULL BOT // Features: AI, PDF, STICKER, IMAGE, YTMP3, YTMP4, PDF, MENU, VOTE, SIMI, OWNER, etc. // Owner: 255624236654
import { makeInMemoryStore } from "@whiskeysockets/baileys";
import { DisconnectReason } from "@whiskeysockets/baileys";
import { useMultiFileAuthState, makeWASocket, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";

const prefix = process.env.PREFIX || '!';
 const OWNER = process.env.OWNER_NUMBER || '255624236654';
 const BOT_NAME = process.env.BOT_NAME || 'Ben Whittaker Tech';

 const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

let votes = {}

async function startBot() { const { state, saveCreds } = await useMultiFileAuthState('auth'); const { version } = await fetchLatestBaileysVersion(); const sock = makeWASocket({ version, printQRInTerminal: true, auth: state, logger: pino({ level: 'silent' }), browser: ['Ben Whittaker Tech', 'Safari', '1.0.0'] })

store.bind(sock.ev);
sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401 ) {
    startBot();
  } else if (connection === 'open') {
    console.log(`\n✅ ${BOT_NAME} connected!`);
  }
});

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.remoteJid === 'status@broadcast') {
    return;
  }

const from = msg.key.remoteJid
const isGroup = from.endsWith('@g.us')
const sender = msg.key.participant || msg.key.remoteJid
const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
const isCmd = body.startsWith(prefix)
const command = isCmd ? body.slice(1).split(' ')[0].toLowerCase() : ''
const args = body.split(' ').slice(1)
const reply = (text) => sock.sendMessage(from, { text }, { quoted: msg })

// SET FEATURE ON/OFF
if (command === 'set') {
  if (!sender.includes(OWNER)) return reply('❌ Huna ruhusa kubadili settings.')
  if (args.length !== 2) return reply(`Usage: ${prefix}set FEATURE on/off`)
  const [feature, value] = args
  const envFile = fs.readFileSync('.env', 'utf-8').split('\n').map(line => {
    if (line.startsWith(`${feature.toUpperCase()}=`)) {
      return `${feature.toUpperCase()}=${value.toLowerCase()}`
    }
    return line
  })
  fs.writeFileSync('.env', envFile.join('\n'))
  return reply(`✅ ${feature.toUpperCase()} set to "${value.toLowerCase()}"`)
}

if (command === 'ping') return reply('🥊 Pong!')
if (command === 'time') return reply(`⏰ ${moment().tz('Africa/Dar_es_Salaam').format('HH:mm:ss')}`)

// AI Chat
if (command === 'ai' && process.env.AI_FEATURE === 'on') {
  const q = args.join(' ')
  if (!q) return reply('❌ Uliza swali: !ai what is AI')
  const res = await axios.get(`https://api.akuari.my.id/ai/gpt?chat=${encodeURIComponent(q)}`)
  return reply(`🤖 ${res.data.respon}`)
}

// Vote system
if (command === 'vote') {
  const topic = args.join(' ')
  if (!topic) return reply('Tumia: !vote Je, tukubali hii idea?')
  votes[from] = { yes: 0, no: 0, topic }
  return reply(`🗳️ Kura ya maoni: *${topic}*\nReply kwa !yes au !no`)
}
if (command === 'yes' && votes[from]) {
  votes[from].yes++
  return reply('✅ Kura yako ya NDIO imehesabiwa')
}
if (command === 'no' && votes[from]) {
  votes[from].no++
  return reply('❌ Kura yako ya HAPANA imehesabiwa')
}
if (command === 'results' && votes[from]) {
  return reply(`📊 Matokeo ya kura: *${votes[from].topic}*\n✅ NDIO: ${votes[from].yes}\n❌ HAPANA: ${votes[from].no}`)
}

// Simi
if (command === 'simi' && process.env.SIMI_FEATURE === 'on') {
  const q = args.join(' ')
  const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(q)}&lc=sw&cf=false`)
  return reply(res.data.success)
}

// Image generation
if (command === 'imggen' && process.env.IMG_FEATURE === 'on') {
  const prompt = args.join(' ')
  if (!prompt) return reply('Tuma mfano: !imggen sunset over water')
  const res = await axios.get(`https://api.akuari.my.id/ai/imagen?text=${encodeURIComponent(prompt)}`)
  return sock.sendMessage(from, { image: { url: res.data.url }, caption: '🧠 Image generated' }, { quoted: msg })
}

// Play
if (command === 'play' && process.env.MUSIC_FEATURE === 'on') {
  const song = args.join(' ')
  const res = await axios.get(`https://api.akuari.my.id/downloader/youtubeaudio?query=${encodeURIComponent(song)}`)
  return sock.sendMessage(from, { audio: { url: res.data.mp3 }, mimetype: 'audio/mpeg' }, { quoted: msg })
}

// YT Video
if (command === 'ytmp4' && process.env.VIDEO_FEATURE === 'on') {
  const url = args[0]
  const res = await axios.get(`https://api.akuari.my.id/downloader/youtubevideo?link=${url}`)
  return sock.sendMessage(from, { video: { url: res.data.video }, caption: res.data.title }, { quoted: msg })
}

// Owner
if (command === 'owner') return reply(`👑 Bot Owner: wa.me/${OWNER}`)

// Menu
if (command === 'menu') {
  return reply(`📜 ${BOT_NAME} Menu:

!ai <swali> !play <wimbo> !ytmp4 <link> !pdf <pages> !imggen <prompt> !vote <topic> !yes / !no / !results !simi <swali> !owner !set FEATURE on/off`) } }) }

startBot()

