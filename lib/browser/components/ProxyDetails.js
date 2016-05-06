import React, {PropTypes} from 'react'

const ProxyDetails = ({proxy}) => {
  if (proxy == null) return <div></div>

  const contentType = proxy.response.headers['content-type']
  const body = proxy.response.body

  if (contentType.startsWith('image/')) {
    const imgUrl = URL.createObjectURL(new Blob([body], {type: contentType}))
    return <img src={imgUrl} />
  }

  return (
    <div>
      <p>{body.toString()}</p>
    </div>
  )
}

ProxyDetails.propTypes = {
  proxy: PropTypes.object
}

export default ProxyDetails
