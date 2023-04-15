import express from 'express'
import path from 'path'
import { cwd } from './config.js'

export class Server {
    constructor(PORT) {
        if (typeof PORT !== 'number') {
            throw new Error('PORT must be a number')
        }

        this.server = express()
        this.PORT = PORT

        this.server.use(express.static(`${cwd}/static`))

        this.server.set('views', path.join(cwd, '/static/views'))
        this.server.set('view engine', 'pug')

        this.server.get('/', (req, res) => {
            res.render('pages/index')
        })

        this.server.get('/passengers', (req, res) => {
            res.render('pages/passengers')
        })

        this.server.get('/tickets', (req, res) => {
            res.render('pages/tickets')
        })

        this.server.get('/trains', (req, res) => {
            res.render('pages/trains')
        })

        this.server.get('/sold-tickets', (req, res) => {
            res.render('pages/soldTickets')
        })
    }

    start() {
        this.server.listen(this.PORT, () => {
            console.log(`[SERVER] Listening on port ${this.PORT}`)
        })
    }
}
