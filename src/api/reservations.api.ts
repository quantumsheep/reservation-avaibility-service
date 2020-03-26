import axios from 'axios'
import moment from 'moment'

import api from '../api'

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

export async function is_available(id: string, date: string, hour: number) {
  const reservations = await api.reservations.get(date, id)
  const timetables = await api.timetables.get(date, id)

  if (reservations.error) {
    throw new Error(reservations.error)
  } else if (!reservations.reservations) {
    throw new Error('An error occured.')
  }

  if (timetables.error) {
    throw new Error(timetables.error)
  } else if (!timetables.timetables) {
    throw new Error('An error occured.')
  }

  let available = false

  const selected = moment(`${date} ${hour}`, 'YYYY-MM-DD HH')

  if (timetables.open) {
    for (const timetable of timetables.timetables) {
      const opening = moment(timetable.opening, 'YYYY-MM-DD HH::mm:ss')
      const closing = moment(timetable.closing, 'YYYY-MM-DD HH::mm:ss')

      if (selected >= opening && selected < closing) {
        available = true
        break;
      }
    }

    for (const reservation of reservations.reservations) {
      const reservationStart = moment(reservation.reservationStart, 'YYYY-MM-DD HH::mm:ss')
      const reservationEnd = moment(reservation.reservationEnd, 'YYYY-MM-DD HH::mm:ss')

      if (selected >= reservationStart && selected < reservationEnd) {
        available = false
        break;
      }
    }
  }

  return available
}
