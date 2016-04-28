import {connect} from 'react-redux'
import ProxyDetails from '../components/ProxyDetails'

const mapStateToProps = ({proxyDetails}) => {
  return {proxy: proxyDetails}
}

const ProxyDetailsContainer = connect(
  mapStateToProps,
  null
)(ProxyDetails)

export default ProxyDetailsContainer
