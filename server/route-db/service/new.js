import mongo from '../../mongodb'

export default async (req, res) => {
  let data = req.body
  let { ServiceBot } = mongo.get() // LineInbound, LineOutbound, LineCMD, ServiceOauth
  try {
    if (await ServiceBot.findOne({ service: data.name })) throw new Error('name is duplicate.')
  
    await new ServiceBot({
      name: data.name,
      service: data.name,
      client: data.client_id,
      secret: data.client_secret
    }).save()
  } catch (ex) {
    res.json({ error: ex.message })
  }
  res.end()
}
