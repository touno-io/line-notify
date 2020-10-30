const { notice } = require('@touno-io/db/schema')
const logger = require('@touno-io/debuger')('API')

module.exports = async (req, res) => {
  const { bot, id } = req.params
  try {
    await notice.open()
    const { LineCMD } = notice.get()
    if (!bot) {
      const data = await LineCMD.find({
        executed: false,
        executing: false
      }, null, { limit: 100, sort: { created: -1, executed: 1 } })
      res.json(data || [])
    } else if (!id) {
      const filter = { executed: false, executing: false, botname: bot }
      const data = await LineCMD.find(filter, null, { limit: 10 })
      res.json(data || [])
    } else {
      const updated = { updated: new Date() }
      const where = id !== 'clear' ? { _id: id } : { botname: bot }
      await LineCMD.updateMany(where, {
        $set: Object.assign(updated, (Object.keys(req.body).length > 0 ? req.body : { executed: true, executing: true }))
      })
      res.json({ error: null })
    }
  } catch (ex) {
    logger.error(ex)
    res.status(500).json({ error: ex.stack || ex.message || ex })
  }
  res.end()
}
