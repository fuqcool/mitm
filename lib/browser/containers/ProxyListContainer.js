import {connect} from 'react-redux'
import ProxyList from '../components/ProxyList'

const mapStateToProps = ({proxies, proxyFilter}) => {
  return {
    proxies: proxies.filter((proxy) => (
      proxy.request.url.includes(proxyFilter)
    ))
  }
}

const ProxyListContainer = connect(
  mapStateToProps,
  null
)(ProxyList)

export default ProxyListContainer
