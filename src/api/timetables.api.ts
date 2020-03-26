import axios from 'axios'

const url = process.env.API_URL

export interface ITimetable {
  opening: string
  closing: string
}

export interface ITimetables {
  open?: boolean
  timetables?: ITimetable[]
  error?: string
}

export async function get(date: string, id: string): Promise<ITimetables> {
  const { data } = await axios.get(`${url}/timetables?date=${date}&resourceId=${id}`)
  return data
}
