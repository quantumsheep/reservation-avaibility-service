import axios from 'axios'

const url = process.env.API_URL

export interface IReservation {
    reservationStart: string
    reservationEnd: string
}

export interface IReservations {
    reservations?: IReservation[]
    error?: string
}

export async function get(date: string, id: string): Promise<IReservations> {
    const { data } = await axios.get(`${url}/reservations?date=${date}&resourceId=${id}`)
    return data
}
