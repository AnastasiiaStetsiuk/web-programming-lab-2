import { getData, setData } from './db.js'
import { $, rabinKarp, removeChildren } from './utlls.js'

export class Passenger {
    constructor(id, name, passport) {
        if (typeof id !== 'number') {
            throw new Error('ID must be a number')
        }
        if (typeof name !== 'string') {
            throw new Error('NAME must be a string')
        }
        if (typeof passport !== 'number') {
            throw new Error('PASSPORT must be a number')
        }

        this.id = id
        this.name = name
        this.passport = passport
    }
}

export class PassengerService {
    constructor() {
        this.serviceName = 'passengers'
        this.passengers = getData(this.serviceName) || []

        // add
        this.addNameInput = $('#passenger-add-name-input')
        this.addPassportInput = $('#passenger-add-passport-input')
        this.addButton = $('#passenger-add-button')

        // edit
        this.editIdInput = $('#passenger-edit-id-input')
        this.editNameInput = $('#passenger-edit-name-input')
        this.editPassportInput = $('#passenger-edit-passport-input')
        this.editButton = $('#passenger-edit-button')

        // remove
        this.removeInput = $('#passenger-remove-input')
        this.removeButton = $('#passenger-remove-button')

        // search
        this.searchInput = $('#passenger-search-input')

        // log
        this.logElement = $('#passenger-log')

        // table
        this.table = $('#passenger-table')

        this.addButton?.addEventListener('click', this.add.bind(this))
        this.editButton?.addEventListener('click', this.edit.bind(this))
        this.removeButton?.addEventListener('click', this.remove.bind(this))
        this.searchInput?.addEventListener('input', this.search.bind(this))

        this.render(this.passengers)
    }

    add() {
        const name = this.addNameInput.value
        const passport = this.addPassportInput.value

        if (!this.validateData({ name, passport })) {
            return
        }

        const id = this.uid()
        const passenger = new Passenger(id, name, +passport)

        this.passengers.push(passenger)
        this.addNameInput.value = ''
        this.addPassportInput.value = ''
        this.render(this.passengers)
        this.log('Пасажира додано ✅')
    }

    edit() {
        const id = parseInt(this.editIdInput.value)
        const name = this.editNameInput.value
        const passport = this.editPassportInput.value

        if (!this.validateId(id)) {
            return
        }
        if (!this.validateData({ name, passport })) {
            return
        }

        this.passengers = this.passengers.map(item => {
            if (item.id === id) {
                return new Passenger(id, name, +passport)
            }
            return item
        })

        this.editIdInput.value = ''
        this.editNameInput.value = ''
        this.editPassportInput.value = ''
        this.render(this.passengers)
        this.log('Пасажира змінено ✅')
    }

    remove() {
        const id = +this.removeInput.value

        if (!this.validateId(id)) {
            return
        }

        this.passengers = this.passengers.filter(item => +item.id !== +id)
        this.removeInput.value = ''
        this.render(this.passengers)
        this.log('Пасажира видалено ✅')
    }

    search() {
        const query = this.searchInput.value.toLowerCase()

        if (query.length === 0) {
            this.render(this.passengers)
            return this.log('Пошук скасовано. Введіть запит для пошуку')
        }

        const filtered = this.passengers.filter(item => {
            const id = item.id.toString()
            const name = item.name.toLowerCase()
            const passport = item.passport.toString().toLowerCase()
            return rabinKarp(id, query) || rabinKarp(name, query) || rabinKarp(passport, query)
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
            const eName = document.createElement('td')
            const ePassport = document.createElement('td')
            eId.setAttribute('scope', 'row')
            eId.innerHTML = id
            eName.innerHTML = name
            ePassport.innerHTML = passport
            row.appendChild(eId)
            row.appendChild(eName)
            row.appendChild(ePassport)
            return row
        }

        removeChildren(this.table)

        data.forEach(item => {
            const tr = createRow(item.id, item.name, item.passport)
            this.table.appendChild(tr)
        })

        this.save()
    }

    // helpers

    uid() {
        return this.passengers.length + 1
    }

    save() {
        setData(this.serviceName, this.passengers)
    }

    validateId(id) {
        const idStr = id.toString()

        if (idStr.length === 0) {
            this.log('Введіть ID пасажира')
            return false
        }
        if (isNaN(id)) {
            this.log('ID повинен містити тільки цифри')
            return false
        }
        if (!this.passengers.find(item => +item.id === +id)) {
            this.log(`Пасажира з ID ${id} не існує`)
            return false
        }

        return true
    }

    validateData({ name, passport }) {
        const isPassportUnique = this.passengers.every(item => +item.passport !== +passport)

        if (name.length === 0) {
            this.log('Введіть імʼя пасажира')
            return false
        }
        if (passport.length === 0) {
            this.log('Введіть паспорт пасажира')
            return false
        }
        if (isNaN(passport)) {
            this.log('Паспорт повинен містити тільки цифри')
            return false
        }
        if (!isPassportUnique) {
            this.log(`Паспорт ${passport} вже існує в базі даних`)
            return false
        }

        return true
    }
}
