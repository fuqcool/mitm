import {connect} from 'react-redux'
import {filterProxy} from '../actions'
import ProxyFilter from '../components/ProxyFilter'

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (text) => {
      dispatch(filterProxy(text))
    }
  }
}

const ProxyFilterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProxyFilter)

export default ProxyFilterContainer
