import {connect} from 'react-redux'
import Proxy from '../components/Proxy'
import {showProxyDetails} from '../actions'

const mapStateToProps = (state, {proxy}) => {
  let selected = false

  if (state.proxyDetails) {
    selected = state.proxyDetails.id === proxy.id
  }

  return {proxy, selected}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (proxy) => {
      dispatch(showProxyDetails(proxy))
    }
  }
}

const ProxyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Proxy)

export default ProxyContainer
