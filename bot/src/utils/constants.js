export const PROVIDE_KEYWORDS = 'provide.keywords'
export const GET_KEYWORDS = 'get.keywords'
export const UPDATE_KEYWORDS = 'update.keywords'

export const inlineKeyboard = [
  [
    {
      text: 'Provide keywords',
      callback_data: PROVIDE_KEYWORDS
    }],
  [{
    text: 'Get my keywords',
    callback_data: GET_KEYWORDS
  }],
  [{
    text: 'Update my keywords',
    callback_data: UPDATE_KEYWORDS
  }]

]

export const TOKEN = process.env.TOKEN
