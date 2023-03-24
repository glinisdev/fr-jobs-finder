export const PROVIDE_KEYWORDS = 'provide.keywords'
export const GET_KEYWORDS = 'get.keywords'
export const UPDATE_KEYWORDS = 'update.keywords'

export const Status = {
  NEW: 'new',
  PROVIDING_KEYWORDS: 'providing.keywords',
  UPDATING_KEYWORDS: 'updating.keywords',
  KEYWORDS_PROVIDED: 'keywords.provided'
}

export const inline_keyboard = [
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
