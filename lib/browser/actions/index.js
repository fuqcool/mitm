export function addProxy(proxy) {
  return {
    type: 'ADD_PROXY',
    proxy
  }
}

export function filterProxy(filter) {
  return {
    type: 'FILTER_PROXY',
    filter
  }
}

export function showProxyDetails(proxy) {
  return {
    type: 'SHOW_PROXY_DETAILS',
    proxy
  }
}
