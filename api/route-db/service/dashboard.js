const { notice } = require('@touno-io/db/schema')

module.exports = async (req) => {
  const { LineBot, LineBotRoom, ServiceBot, ServiceBotOauth, ChatWebhook } = notice.get()
  const userId = req.headers['x-id']
  if (userId) {
    const bot = await LineBot.aggregate([
      { $match: { active: true, userId } },
      { $project: { _id: 1, text: '$name', value: '$botname', type: 'bot', stats: '$options.stats' } },
      {
        $lookup: {
          as: 'room',
          from: 'db-line-bot-room',
          let: { botname: '$value' },
          pipeline: [
            { $match: { active: true } },
            { $match: { $expr: { $eq: ['$botname', '$$botname'] } } },
            { $project: { _id: 0, name: 1, botname: 1 } },
            { $sort: { name: 1 } }
          ]
        }
      },
      { $sort: { botname: 1, name: 1 } }
    ])
    const notify = await ServiceBot.aggregate([
      { $match: { active: true, userId } },
      { $project: { _id: 1, client: 1, secret: 1, text: '$name', value: '$service', type: 'notify' } },
      { $sort: { service: 1 } },
      {
        $lookup: {
          as: 'room',
          from: 'db-service-oauth',
          let: { service: '$value' },
          pipeline: [
            { $match: { accessToken: { $ne: null } } },
            { $match: { $expr: { $eq: ['$service', '$$service'] } } },
            { $project: { _id: 0, accessToken: 1, value: '$room', name: 1 } },
            { $sort: { value: 1, name: 1 } }
          ]
        }
      }
    ])
    return { bot, notify }
  }

  const webhook = await ChatWebhook.find({ active: true }, null, { sort: { botname: 1 } })
  const bot = await LineBot.find({ active: true }, null, { sort: { botname: 1 } })
  const room = await LineBotRoom.find({ active: true }, null, { sort: { botname: 1, name: 1 } })
  const service = await ServiceBot.find({ active: true }, null, { sort: { name: 1 } })
  const oauth = await ServiceBotOauth.find({ accessToken: { $ne: null } }, null, { sort: { service: 1, name: 1 } })

  return {
    service: service.filter(e => e.service !== 'log').map(e => ({
      _id: e._id,
      text: e.name,
      value: e.service,
      room: oauth.filter(r => r.service === e.service && r.accessToken).map(e => ({ service: e.service, value: e.room, text: e.name, _id: e._id }))
    })),
    bot: bot.map(e => ({
      _id: e._id,
      text: e.name,
      value: e.botname,
      stats: e.options && e.options.stats ? e.options.stats : {},
      room: room.filter(r => r.botname === e.botname && r.active).map(e => ({ botname: e.botname, value: e.name, text: e.name, _id: e._id }))
    })),
    webhook: webhook.map(e => ({
      _id: e._id,
      botname: e.botname,
      name: e.name,
      type: e.type
    }))
  }
}
