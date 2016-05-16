import React, {PropTypes} from 'react'

function renderKeyVal(key, val) {
  return <p style={{wordBreak: 'break-all'}}><b>{key}:</b> {val}</p>
}

function renderHeaders(headers) {
  return Object.keys(headers).map((key) => {
    const val = headers[key]

    return <div key={key}>{renderKeyVal(key, val)}</div>
  })
}

const ProxyDetails = ({proxy}) => {
  if (proxy == null) return null

  let html = null

  const contentType = proxy.response.headers['content-type']
  const body = proxy.response.body

  if (contentType.startsWith('image/')) {
    const imgUrl = URL.createObjectURL(new Blob([body], {type: contentType}))
    html = <img src={imgUrl} />
  } else {
    html = (
      <div>
        <p style={{wordBreak: 'break-all'}}>{body.toString()}</p>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-md-12">

        {renderKeyVal('URL', proxy.request.url)}
        {renderKeyVal('Method', proxy.request.method)}
        {renderKeyVal('Status', proxy.response.statusCode + ' ' + proxy.response.statusMessage)}

        <hr />

        {renderHeaders(proxy.request.headers)}

        <hr />

        {renderHeaders(proxy.response.headers)}

        <hr />

        {html}


      </div>
    </div>
  )
}

ProxyDetails.propTypes = {
  proxy: PropTypes.object
}

export default ProxyDetails
