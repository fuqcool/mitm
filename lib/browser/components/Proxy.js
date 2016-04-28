import React, {PropTypes} from 'react'
import classNames from 'classnames'

const Proxy = ({proxy, selected, onClick}) => {
  const itemClass = classNames({
    'list-group-item': true,
    active: selected
  })

  return (
    <div className={itemClass} style={{wordBreak: 'break-all', cursor: 'pointer'}} onClick={() => onClick(proxy)}>
      <span className="label label-default" style={{marginRight: '5px'}}>{proxy.request.method}</span>
      <span className="label label-default" style={{marginRight: '5px'}}>{proxy.response.statusCode}</span>
      <span>{proxy.request.url}</span>
    </div>
  )
}

Proxy.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  proxy: PropTypes.object.isRequired
}

export default Proxy
