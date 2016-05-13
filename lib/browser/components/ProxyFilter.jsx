import React, {PropTypes} from 'react'

const ProxyFilter = ({onChange}) => (
  <input onChange={e => onChange(e.target.value)} type="text" className="form-control" placeholder="Search..." />
)

ProxyFilter.propTypes = {
  onChange: PropTypes.func.isRequired
}

export default ProxyFilter
