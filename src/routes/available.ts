import { Router } from 'express'
export const router = Router()

import Joi from '@hapi/joi'

import api from '../api'
import schema from '../middlewares/schema.middleware'

interface IAvailableGet {
  id: string
  date: string
  hour: number
}

const schema_available_get = Joi.object({
  id: Joi.string().required(),
  date: Joi.string().required().pattern(/^\d{4}-\d{2}-\d{2}$/),
  hour: Joi.number(),
})

router.get('/available', schema({ query: schema_available_get, }), async (req, res) => {
  try {
    const query = req.query as IAvailableGet

    res.json({
      available: await api.reservations.is_available(query.id, query.date, query.hour),
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
