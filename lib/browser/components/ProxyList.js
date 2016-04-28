import React, {PropTypes} from 'react'
import ProxyContainer from '../containers/ProxyContainer'

const ProxyList = ({proxies}) => (
  <div className="list-group">
    {proxies.map((proxy) => (
      <ProxyContainer key={proxy.id} proxy={proxy} />
    ))}
  </div>
)

ProxyList.propTypes = {
  proxies: PropTypes.array.isRequired
}

export default ProxyList
