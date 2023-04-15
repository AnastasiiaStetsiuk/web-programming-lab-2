import { getData, setData } from './db.js'
import { $, rabinKarp, removeChildren } from './utlls.js'

export class SoldTicketsItem {
    constructor(id, passengerId, trainId, ticketId, date) {
        this.id = id
        this.passengerId = passengerId
        this.trainId = trainId
        this.ticketId = ticketId
        this.date = date
    }
}

export class SoldTicketsService {
    constructor() {
        this.serviceName = 'soldTickets'
        this.soldTickets = getData(this.serviceName) || []

        // add
        this.addPassengerInput = $('#soldTickets-add-passenger-input')
        this.addTrainInput = $('#soldTickets-add-train-input')
        this.addTicketInput = $('#soldTickets-add-ticket-input')
        this.addDateInput = $('#soldTickets-add-date-input')
        this.addButton = $('#soldTickets-add-button')

        // edit
        this.editIdInput = $('#soldTickets-edit-id-input')
        this.editPassengerInput = $('#soldTickets-edit-passenger-input')
        this.editTrainInput = $('#soldTickets-edit-train-input')
        this.editTicketInput = $('#soldTickets-edit-ticket-input')
        this.editDateInput = $('#soldTickets-edit-date-input')
        this.editButton = $('#soldTickets-edit-button')

        // remove
        this.removeInput = $('#soldTickets-remove-input')
        this.removeButton = $('#soldTickets-remove-button')

        // search
        this.searchInput = $('#soldTickets-search-input')

        // log
        this.logElement = $('#soldTickets-log')

        // table
        this.table = $('#soldTickets-table')

        // stats
        this.popularRoutes = $('#soldTickets-popular-routes')
        this.profitableRoutes = $('#soldTickets-profitable-routes')
        this.emptyRoutes = $('#soldTickets-empty-routes')

        this.addButton?.addEventListener('click', this.add.bind(this))
        this.editButton?.addEventListener('click', this.edit.bind(this))
        this.removeButton?.addEventListener('click', this.remove.bind(this))
        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.initialDataCheck()
        this.render(this.soldTickets)
    }

    add() {
        const passengerId = this.addPassengerInput.value
        const trainId = this.addTrainInput.value
        const ticketId = this.addTicketInput.value
        const date = this.addDateInput.value

        if (!this.validateData({ passengerId, trainId, ticketId, date })) {
            return
        }
        if (!this.checkData({ passengerId, trainId, ticketId })) {
            return
        }

        const id = this.uid()
        const soldTicket = new SoldTicketsItem(+id, +passengerId, +trainId, +ticketId, date)

        this.soldTickets.push(soldTicket)
        this.addPassengerInput.value = ''
        this.addTrainInput.value = ''
        this.addTicketInput.value = ''
        this.addDateInput.value = ''
        this.render(this.soldTickets)
        this.log(`Квиток додано ✅`)
    }

    edit() {
        const id = +this.editIdInput.value
        const passengerId = this.editPassengerInput.value
        const trainId = this.editTrainInput.value
        const ticketId = this.editTicketInput.value
        const date = this.editDateInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ passengerId, trainId, ticketId, date })) {
            return
        }
        if (!this.checkData({ passengerId, trainId, ticketId })) {
            return
        }

        this.soldTickets = this.soldTickets.map(item => {
            if (+item.id === id) {
                return new SoldTicketsItem(+id, +passengerId, +trainId, +ticketId, date)
            }
            return item
        })

        this.editIdInput.value = ''
        this.editPassengerInput.value = ''
        this.editTrainInput.value = ''
        this.editTicketInput.value = ''
        this.editDateInput.value = ''
        this.render(this.soldTickets)
        this.log(`Квиток відредаговано ✅`)
    }

    remove() {
        const id = +this.removeInput.value

        if (!this.validateId(id)) {
            return
        }

        this.soldTickets = this.soldTickets.filter(item => +item.id !== id)
        this.removeInput.value = ''
        this.render(this.soldTickets)
        this.log(`Квиток видалено ✅`)
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.soldTickets)
            this.log('Пошук скасовано. Введіть запит для пошуку')
            return
        }

        const filtered = this.soldTickets.filter(item => {
            const { id, passenger, train, ticket, date } = item
            return (
                rabinKarp(id, query) ||
                rabinKarp(passenger.id, query) ||
                rabinKarp(passenger.name, query) ||
                rabinKarp(passenger.passport, query) ||
                rabinKarp(train.id, query) ||
                rabinKarp(train.name, query) ||
                rabinKarp(train.route, query) ||
                rabinKarp(train.number, query) ||
                rabinKarp(ticket.id, query) ||
                rabinKarp(ticket.number, query) ||
                rabinKarp(ticket.price, query) ||
                rabinKarp(date, query)
            )
        })

        this.render(filtered)
        this.log(`Знайдено ${filtered.length} квитків ✅`)
    }

    log(message) {
        this.logElement.innerHTML = message
    }

    render(data) {
        if (!this.table || !Array.isArray(data)) {
            return
        }

        const createRow = (id, passenger, train, ticket, date) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const ePassenger = document.createElement('td')
            const eTrain = document.createElement('td')
            const eTicket = document.createElement('td')
            const eDate = document.createElement('td')
            eId.setAttribute('scope', 'row')
            eId.innerHTML = id
            ePassenger.innerHTML = passenger
            eTrain.innerHTML = train
            eTicket.innerHTML = ticket
            eDate.innerHTML = date
            row.appendChild(eId)
            row.appendChild(ePassenger)
            row.appendChild(eTrain)
            row.appendChild(eTicket)
            row.appendChild(eDate)
            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const { id, passengerId, trainId, ticketId, date } = item
            const row = createRow(id, passengerId, trainId, ticketId, date)
            this.table.appendChild(row)
        })

        this.save()

        this.renderPopularRoutes()
        this.renderProfitableRoutes()
        this.renderEmptyRoutes()
    }

    renderPopularRoutes() {
        const popularRoutes = this.getPopularRoutes()

        removeChildren(this.popularRoutes)

        popularRoutes.forEach(item => {
            const [route, count] = item
            const li = document.createElement('li')
            li.innerHTML = `${route} - ${count}`
            this.popularRoutes.appendChild(li)
        })
    }

    renderProfitableRoutes() {
        const profitableRoutes = this.getProfitableRoutes()

        removeChildren(this.profitableRoutes)

        profitableRoutes.forEach(item => {
            const [route, profit] = item
            const li = document.createElement('li')
            li.innerHTML = `${route} - ${profit}`
            this.profitableRoutes.appendChild(li)
        })
    }

    renderEmptyRoutes() {
        const emptyRoutes = this.getEmptyRoutes()

        removeChildren(this.emptyRoutes)

        emptyRoutes.forEach(item => {
            const li = document.createElement('li')
            li.innerHTML = item
            this.emptyRoutes.appendChild(li)
        })
    }

    // helpers

    uid() {
        return this.soldTickets.length + 1
    }

    save() {
        setData(this.serviceName, this.soldTickets)
    }

    initialDataCheck() {
        const passengers = getData('passengers')
        const tickets = getData('tickets')
        const trains = getData('trains')

        this.soldTickets.forEach(soldTick => {
            const { passengerId, trainId, ticketId } = soldTick

            const passengerExists = passengers.find(item => +item.id === +passengerId) !== undefined
            const trainExists = trains.find(item => +item.id === +trainId) !== undefined
            const ticketExists = tickets.find(item => +item.id === +ticketId) !== undefined

            if (!passengerExists || !trainExists || !ticketExists) {
                this.soldTickets = this.soldTickets.filter(item => +item.id !== +soldTick.id)
            }
        })
    }

    checkData({ passengerId, trainId, ticketId }) {
        const passengers = getData('passengers')
        const tickets = getData('tickets')
        const trains = getData('trains')

        if (!passengers.find(item => +item.id === +passengerId)) {
            this.log(`Пасажира ${passengerId} не існує`)
            return false
        }
        if (!trains.find(item => +item.id === +trainId)) {
            this.log(`Потяга ${trainId} не існує`)
            return false
        }
        if (!tickets.find(item => +item.id === +ticketId)) {
            this.log(`Квитка ${ticketId} не існує`)
            return false
        }

        return true
    }

    validateId(id) {
        const idStr = id.toString()

        if (idStr.length === 0) {
            this.log('Введіть ID')
            return false
        }
        if (isNaN(id)) {
            this.log('ID повинен бути числом')
            return false
        }
        if (!this.soldTickets.find(t => t.id === id)) {
            this.log(`ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ passengerId, trainId, ticketId, date }) {
        const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/

        if (!passengerId) {
            this.log('Введіть пасажира')
            return false
        }
        if (!trainId) {
            this.log('Введіть потяг')
            return false
        }
        if (!ticketId) {
            this.log('Введіть квиток')
            return false
        }
        if (!date) {
            this.log('Введіть дату')
            return false
        }
        if (!dateRegex.test(date)) {
            this.log('Неправильний формат дати')
            return false
        }

        return true
    }

    getPopularRoutes() {
        const routes = {}

        this.soldTickets.forEach(item => {
            const { trainId } = item
            const train = getData('trains').find(item => +item.id === +trainId)
            const { route } = train

            if (!routes[route]) {
                routes[route] = 0
            }

            routes[route]++
        })

        return Object.entries(routes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
    }

    getProfitableRoutes() {
        const routes = {}

        this.soldTickets.forEach(item => {
            const { trainId, ticketId } = item
            const train = getData('trains').find(item => +item.id === +trainId)
            const { route } = train
            const ticket = getData('tickets').find(item => +item.id === +ticketId)
            const { price } = ticket

            if (!routes[route]) {
                routes[route] = 0
            }

            routes[route] += +price
        })

        return Object.entries(routes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
    }

    getEmptyRoutes() {
        const routes = {}

        getData('trains').forEach(item => {
            routes[item.route] = true
        })

        this.soldTickets.forEach(item => {
            const { trainId } = item
            const train = getData('trains').find(item => +item.id === +trainId)
            const { route } = train

            delete routes[route]
        })

        return Object.keys(routes)
    }
}
