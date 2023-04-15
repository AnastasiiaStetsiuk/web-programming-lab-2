import dotenv from 'dotenv'

dotenv.config()

export const cwd = process.cwd() + '/src'
export const PORT = +process.env.PORT || 4000
