import { Request, Response, NextFunction } from 'express'
import Joi from '@hapi/joi'

interface SchemaOptions {
  body?: Joi.ObjectSchema<any>
  query?: Joi.ObjectSchema<any>
}

export default (schema: SchemaOptions) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schema.body) {
      req.body = await schema.body.validateAsync(req.body)
    }

    if (schema.query) {
      req.query = await schema.query.validateAsync(req.query)
    }

    next()
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
}
