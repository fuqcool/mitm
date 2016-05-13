import React from 'react'
import ProxyListContainer from '../containers/ProxyListContainer'
import ProxyFilterContainer from '../containers/ProxyFilterContainer'
import ProxyDetailsContainer from '../containers/ProxyDetailsContainer'

const App = () => (
  <div className="row">
    <div className="col-md-12" style={{margin: '10px 0'}}>
      <div className="form">
        <ProxyFilterContainer />
      </div>
    </div>

    <div className="col-md-12">
      <div className="row">
        <div className="col-md-4">
          <ProxyListContainer />
        </div>

        <div className="col-md-8">
          <ProxyDetailsContainer />
        </div>
      </div>
    </div>
  </div>
)

export default App
