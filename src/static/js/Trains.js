import { getData, setData } from './db.js'
import { $, rabinKarp, removeChildren } from './utlls.js'

export class Train {
    constructor(id, name, route, number) {
        if (typeof id !== 'number') {
            throw new Error('ID must be a number')
        }
        if (typeof name !== 'string') {
            throw new Error('NAME must be a string')
        }
        if (typeof route !== 'string') {
            throw new Error('ROUTE must be a string')
        }
        if (typeof number !== 'number') {
            throw new Error('NUMBER must be a number')
        }

        this.id = id
        this.name = name
        this.route = route
        this.number = number
    }
}

export class TrainService {
    constructor() {
        this.serviceName = 'trains'
        this.trains = getData(this.serviceName) || []

        // add
        this.addNameInput = $('#train-add-name-input')
        this.addRouteInput = $('#train-add-route-input')
        this.addNumberInput = $('#train-add-number-input')
        this.addButton = $('#train-add-button')

        // edit
        this.editIdInput = $('#train-edit-id-input')
        this.editNameInput = $('#train-edit-name-input')
        this.editRouteInput = $('#train-edit-route-input')
        this.editNumberInput = $('#train-edit-number-input')
        this.editButton = $('#train-edit-button')

        // remove
        this.removeInput = $('#train-remove-input')
        this.removeButton = $('#train-remove-button')

        // search
        this.searchInput = $('#train-search-input')

        // log
        this.logElement = $('#train-log')

        // table
        this.table = $('#train-table')

        this.addButton?.addEventListener('click', this.add.bind(this))
        this.editButton?.addEventListener('click', this.edit.bind(this))
        this.removeButton?.addEventListener('click', this.remove.bind(this))
        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.render(this.trains)
    }

    add() {
        const name = this.addNameInput.value
        const route = this.addRouteInput.value
        const number = this.addNumberInput.value

        if (!this.validateData({ name, route, number })) {
            return
        }

        const id = this.uid()
        const train = new Train(+id, name, route, +number)

        this.trains.push(train)
        this.addNameInput.value = ''
        this.addRouteInput.value = ''
        this.addNumberInput.value = ''
        this.render(this.trains)
        this.log('Потяг додано ✅')
    }

    edit() {
        const id = parseInt(this.editIdInput.value)
        const name = this.editNameInput.value
        const route = this.editRouteInput.value
        const number = this.editNumberInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ name, route, number })) {
            return
        }

        this.trains = this.trains.map(item => {
            if (+item.id === +id) {
                return new Train(id, name, +route, +number)
            }
            return item
        })

        this.editIdInput.value = ''
        this.editNameInput.value = ''
        this.editRouteInput.value = ''
        this.editNumberInput.value = ''
        this.render(this.trains)
        this.log('Потяг змінено ✅')
    }

    remove() {
        const id = parseInt(this.removeInput.value)

        if (!this.validateId(id)) {
            return
        }

        this.trains = this.trains.filter(item => +item.id !== +id)
        this.removeInput.value = ''
        this.render(this.trains)
        this.log('Потяг видалено ✅')
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.trains)
            return this.log('Пошук скасовано. Введіть запит для пошуку')
        }

        const filtered = this.trains.filter(item => {
            const id = item.id.toString()
            const name = item.name.toLowerCase()
            const route = item.route.toLowerCase()
            const number = item.number.toString()
            return (
                rabinKarp(id, query) ||
                rabinKarp(name, query) ||
                rabinKarp(route, query) ||
                rabinKarp(number, query)
            )
        })

        this.render(filtered)
        this.render(`Знайдено ${filtered.length} квитків ✅`)
    }

    log(message) {
        this.logElement.innerHTML = message
    }

    render(data) {
        if (!this.table || !Array.isArray(data)) {
            return
        }

        const createRow = (id, name, route, number) => {
            const row = document.createElement('tr')
            const eId = document.createElement('td')
            const eName = document.createElement('td')
            const eRoute = document.createElement('td')
            const eNumber = document.createElement('td')
            eId.setAttribute('scope', 'row')
            eId.innerHTML = id
            eName.innerHTML = name
            eRoute.innerHTML = route
            eNumber.innerHTML = number
            row.appendChild(eId)
            row.appendChild(eName)
            row.appendChild(eRoute)
            row.appendChild(eNumber)
            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const row = createRow(item.id, item.name, item.route, item.number)
            this.table.appendChild(row)
        })

        this.save()
    }

    // helpers

    uid() {
        return this.trains.length + 1
    }

    save() {
        setData(this.serviceName, this.trains)
    }

    validateId(id) {
        const idStr = id.toString()

        if (idStr.length === 0) {
            this.log('Введіть ID потягу')
            return false
        }
        if (isNaN(id)) {
            this.log('ID потягу повинен містити тільки цифри')
            return false
        }
        if (!this.trains.find(item => +item.id === +id)) {
            this.log(`Потягу з ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ name, route, number }) {
        const isNumberUnique = this.trains.every(item => +item.number !== +number)

        if (!name) {
            this.log('Введіть назву потягу')
            return false
        }
        if (!route) {
            this.log('Введіть маршрут потягу')
            return false
        }
        if (!number) {
            this.log('Введіть номер потягу')
            return false
        }
        if (isNaN(number)) {
            this.log('Номер потягу повинен містити тільки цифри')
            return false
        }
        if (!isNumberUnique) {
            this.log(`Номер ${number} вже існує в базі даних`)
            return false
        }

        return true
    }
}
