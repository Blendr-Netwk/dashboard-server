import "dotenv/config"
import "module-alias/register"
import { createApp } from "./app"
import { createServer } from "http"
import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { pubClient, subClient } from "./services/redis"
import { PORT } from "./config"
import { initalizeSocketIO } from "./services/socketio"
import { InstanceScheduler } from "./services/instanceScheduler"

const main = async () => {
  const app = createApp()
  const instanceScheduler = new InstanceScheduler()

  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  })

  await pubClient.connect()
  await subClient.connect()
  io.adapter(createAdapter(pubClient, subClient))

  initalizeSocketIO(io)
  instanceScheduler.start()

  httpServer.listen(parseInt(PORT), () => {
    console.log(`server started on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.log(err)
})
