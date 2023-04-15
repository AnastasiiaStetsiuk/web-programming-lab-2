export const getData = key => {
    if (typeof localStorage.getItem(key) == 'undefined') {
        return []
    }
    return JSON.parse(localStorage.getItem(key))
}

export const setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const saveData = (key, value) => {
    window.addEventListener('beforeunload', () => {
        setData(key, value)
    })
}
