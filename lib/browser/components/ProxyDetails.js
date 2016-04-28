import React, {PropTypes} from 'react'

const ProxyDetails = ({proxy}) => {
  if (proxy == null) return <div></div>

  return (
    <div>
      <p>{proxy.response.body.toString()}</p>
    </div>
  )
}

ProxyDetails.propTypes = {
  proxy: PropTypes.object
}

export default ProxyDetails
