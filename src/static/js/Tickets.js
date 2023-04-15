import { getData, setData } from './db.js'
import { $, rabinKarp, removeChildren } from './utlls.js'

export class Ticket {
    constructor(id, number, price) {
        if (typeof id !== 'number') {
            throw new Error('ID must be a number')
        }
        if (typeof number !== 'number') {
            throw new Error('NUMBER must be a number')
        }
        if (typeof price !== 'number') {
            throw new Error('PRICE must be a number')
        }

        this.id = id
        this.number = number
        this.price = price
    }
}

export class TicketService {
    constructor() {
        this.serviceName = 'tickets'
        this.tickets = getData(this.serviceName) || []

        // add
        this.addNumberInput = $('#ticket-add-number-input')
        this.addPriceInput = $('#ticket-add-price-input')
        this.addButton = $('#ticket-add-button')

        // edit
        this.editIdInput = $('#ticket-edit-id-input')
        this.editNumberInput = $('#ticket-edit-number-input')
        this.editPriceInput = $('#ticket-edit-price-input')
        this.editButton = $('#ticket-edit-button')

        // remove
        this.removeInput = $('#ticket-remove-input')
        this.removeButton = $('#ticket-remove-button')

        // search
        this.searchInput = $('#ticket-search-input')

        // log
        this.logElement = $('#ticket-log')

        // table
        this.table = $('#ticket-table')

        this.addButton?.addEventListener('click', this.add.bind(this))
        this.editButton?.addEventListener('click', this.edit.bind(this))
        this.removeButton?.addEventListener('click', this.remove.bind(this))
        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.render(this.tickets)
    }

    add() {
        const number = this.addNumberInput.value
        const price = this.addPriceInput.value

        if (!this.validateData({ number, price })) {
            return
        }

        const id = this.uid()
        const ticket = new Ticket(id, +number, +price)

        this.tickets.push(ticket)
        this.addNumberInput.value = ''
        this.addPriceInput.value = ''
        this.render(this.tickets)
        this.log(`Квиток додано ✅`)
    }

    edit() {
        const id = +this.editIdInput.value
        const number = this.editNumberInput.value
        const price = this.editPriceInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ number, price })) {
            return
        }

        this.tickets = this.tickets.map(item => {
            if (item.id === id) {
                return new Ticket(id, +number, +price)
            }
            return item
        })

        this.editIdInput.value = ''
        this.editNumberInput.value = ''
        this.editPriceInput.value = ''
        this.render(this.tickets)
        this.log(`Квиток відредаговано ✅`)
    }

    remove() {
        const id = +this.removeInput.value

        if (!this.validateId(id)) {
            return
        }

        this.tickets = this.tickets.filter(item => +item.id !== id)
        this.removeInput.value = ''
        this.render(this.tickets)
        this.log(`Квиток видалено ✅`)
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.tickets)
            this.log('Пошук скасовано. Введіть запит для пошуку')
            return
        }

        const filtered = this.tickets.filter(item => {
            const id = item.id.toString()
            const number = item.number.toString()
            const price = item.price.toString()
            return rabinKarp(id, query) || rabinKarp(number, query) || rabinKarp(price, query)
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

        const createRow = (id, name, passport) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const eNumber = document.createElement('td')
            const ePrice = document.createElement('td')
            eId.setAttribute('scope', 'row')
            eId.innerHTML = id
            eNumber.innerHTML = name
            ePrice.innerHTML = passport
            row.appendChild(eId)
            row.appendChild(eNumber)
            row.appendChild(ePrice)
            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const row = createRow(item.id, item.number, item.price)
            this.table.appendChild(row)
        })

        this.save()
    }

    // helpers

    uid() {
        return this.tickets.length + 1
    }

    save() {
        setData(this.serviceName, this.tickets)
    }

    validateId(id) {
        const idStr = id.toString()

        if (idStr.length === 0) {
            this.log('Введіть ID квитка')
            return false
        }
        if (isNaN(id)) {
            this.log('ID повинен містити тільки цифри')
            return false
        }
        if (!this.tickets.find(ticket => +ticket.id === +id)) {
            this.log(`Квитка з ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ number, price }) {
        const isNumberUnique = this.tickets.every(ticket => +ticket.number !== +number)

        if (!number) {
            this.log('Введите номер квитка')
            return false
        }
        if (isNaN(number)) {
            this.log('Номер квитка має містити тільки цифри')
            return false
        }
        if (!price) {
            this.log('Введіть ціну квитка')
        }
        if (isNaN(price)) {
            this.log('Ціна квитка повинна містити тільки цифри')
            return false
        }
        if (!isNumberUnique) {
            this.log(`Квиток ${number} вже існує в базі даних`)
            return false
        }

        return true
    }
}
