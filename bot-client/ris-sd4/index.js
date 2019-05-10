const adminId = 'U6e27176f34129a3cd1386b8849cb0906'
const helpFlex = require('./flex/help-command')

module.exports = {
  party: 'line',
  channelAccessToken: '+7zVjodcOcGcTwlGrIiRH4qxtf+Q0ZPM8cAbqNQZ8i62b7WQG3EsiSGsF5utYAxBXn1vcqMLgqgxqyVw91/e963jwT3oKbcz9m+HTpQOG/VVOcpQzo1YAObiFBn0fhjCxHcNQCBCz8v7mG0r2tYHuwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '2563142f120518b1ceefb051edae2086',
  onEvents: {
    'join': async (event) => {
      let { groupId } = event.source
      return `ID ห้องแชตครับ \`${groupId}\``
    },
    'leave': async (event, client) => {
      await client.pushMessage(adminId, { type: 'text', text: `\`\`\`\n${JSON.stringify(event)}\n\`\`\`` })
    }
  },
  onCommands: {
    // args, event, client
    'id': async (args, event) => {
      let { userId, type, groupId, roomId } = event.source
      if (type === 'room') {
        return roomId // `*RoomId:* \`${roomId}\``
      } else if (type === 'group') {
        return groupId // `*GroupId:* \`${groupId}\``
      } else {
        return userId
      }
    },
    'help': async (args, event) => {
      if (event.source.type === 'user') return helpFlex
    }
  }
}
