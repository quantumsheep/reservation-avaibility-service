import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import Joi from '@hapi/joi'

import api from './api'
import { IReservations } from './api/reservations'
import { ITimetables } from './api/timetables'

const app = express()

interface IAvailableGet {
  id: string
  date: string
  hour: number
}

const schema = Joi.object({
  id: Joi.string().required(),
  date: Joi.string().required().pattern(/^\d{4}-\d{2}-\d{2}$/),
  hour: Joi.number(),
})

function reservation_is_available(reservations: IReservations, timetables: ITimetables, hour: number) {
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

  if (timetables.open) {
    const sanitized_timetables = timetables.timetables.map(timetable => {
      const [, opening] = timetable.opening.split(' ')
      const [, closing] = timetable.closing.split(' ')

      return {
        opening: +opening.split(':')[0],
        closing: +closing.split(':')[0],
      }
    })

    for (const timetable of sanitized_timetables) {
      if (hour >= timetable.opening && hour < timetable.closing) {
        available = true
        break;
      }
    }

    const sanitized_reservations = reservations.reservations.map(reservation => {
      const [, reservationStart] = reservation.reservationStart.split(' ')
      const [, reservationEnd] = reservation.reservationEnd.split(' ')

      return {
        reservationStart: +reservationStart.split(':')[0],
        reservationEnd: +reservationEnd.split(':')[0],
      }
    })

    for (const timetable of sanitized_reservations) {
      if (hour >= timetable.reservationStart && hour < timetable.reservationEnd) {
        available = false
      }
    }
  }

  return available
}

app.get('/available', async (req, res) => {
  try {
    const query: IAvailableGet = await schema.validateAsync(req.query)

    const reservations = await api.reservations.get(query.date, query.id)
    const timetables = await api.timetables.get(query.date, query.id)

    res.json({
      available: reservation_is_available(reservations, timetables, query.hour),
    })
  } catch (e) {
    if ('details' in e) {
      return res.status(400).json({
        errors: (e as Joi.ValidationError).details.map(d => d.message)
      })
    }

    res.status(500).json({
      errors: [e.message]
    })
  }
})

const port = process.env.PORT
app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
