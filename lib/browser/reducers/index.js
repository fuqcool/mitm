import {combineReducers} from 'redux'

function proxies(state=[], action) {
  switch (action.type) {

  case 'ADD_PROXY':
    return [action.proxy, ...state].slice(0, 1000)

  default:
    return state

  }
}

function proxyFilter(state='', action) {
  switch (action.type) {

  case 'FILTER_PROXY':
    return action.filter

  default:
    return state

  }
}

function proxyDetails(state=null, action) {
  switch (action.type) {

  case 'SHOW_PROXY_DETAILS':
    return action.proxy

  default:
    return state

  }
}

export default combineReducers({proxies, proxyFilter, proxyDetails})
