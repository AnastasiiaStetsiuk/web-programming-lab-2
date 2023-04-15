import { PORT } from './config.js'
import { Server } from './server.js'

const server = new Server(PORT)
server.start()
