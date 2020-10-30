const { notice } = require('@touno-io/db/schema')

module.exports = async (req, res) => {
  const { service, room } = req.body
  try {
    await notice.open()
    const { ServiceOauth, ServiceBot } = notice.get() // LineInbound, LineOutbound, LineCMD, ServiceOauth

    if (service && room) {
      if (await ServiceOauth.findOne({ service, room, accessToken: { $ne: null } })) { throw new Error('Room is duplicate.') }
    } else if (service) {
      if (await ServiceBot.findOne({ service, active: { $ne: false } })) { throw new Error('Room is duplicate.') }
    }
    res.json({})
  } catch (ex) {
    res.status(500).json({ error: ex.stack || ex.message || ex })
  } finally {
    res.end()
  }
}
