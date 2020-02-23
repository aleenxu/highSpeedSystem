import React from 'react'
import reactDom from 'react-dom'
import Loadable from 'react-loadable'
import { HashRouter, Route, BrowserHistory, Redirect, Switch } from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'
// import { Provider } from 'react-intl-redux'
import './app.css'
import LoadingPage from './components/LoadingPage/LoadingPage'
import SystemMenu from './components/SystemMenu/SystemMenu'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

const Loading = () => <LoadingPage />
const MonitoringModule = Loadable({
  loader: () => import('./containers/MonitoringModule/MonitoringModule'),
  loading: Loading,
  delay: 0,
})
const ReservePlan = Loadable({
  loader: () => import('./containers/ControlModule/ReservePlan/ReservePlan'),
  loading: Loading,
  delay: 0,
})
const Basics = Loadable({
  loader: () => import('./containers/ControlModule/Basics/Basics'),
  loading: Loading,
  delay: 0,
})
const SimulationModule = Loadable({
  loader: () => import('./containers/SimulationModule/SimulationModule'),
  loading: Loading,
  delay: 0,
})
const Traffic = Loadable({
  loader: () => import('./containers/StatisticsModule/Traffic/Traffic'),
  loading: Loading,
  delay: 0,
})
const Plan = Loadable({
  loader: () => import('./containers/StatisticsModule/Plan/Plan'),
  loading: Loading,
  delay: 0,
})
const Intelligence = Loadable({
  loader: () => import('./containers/EquipmentModule/Intelligence/Intelligence'),
  loading: Loading,
  delay: 0,
})
const TollGate = Loadable({
  loader: () => import('./containers/EquipmentModule/TollGate/TollGate'),
  loading: Loading,
  delay: 0,
})
const User = Loadable({
  loader: () => import('./containers/SystemModule/User/User'),
  loading: Loading,
  delay: 0,
})
const Institution = Loadable({
  loader: () => import('./containers/SystemModule/Institution/Institution'),
  loading: Loading,
  delay: 0,
})

const Parent = () => (
  <div>
    {/* <Route path="*" component={SystemMenu} /> */}
    <Route exact path="/monitoringmodule" component={MonitoringModule} />
    <Route exact path="/reserveplan" component={ReservePlan} />
    <Route exact path="/basics" component={Basics} />
    <Route exact path="/simulationmodule" component={SimulationModule} />
    <Route exact path="/traffic" component={Traffic} />
    <Route exact path="/plan" component={Plan} />
    <Route exact path="/intelligence" component={Intelligence} />
    <Route exact path="/tollgate" component={TollGate} />
    <Route exact path="/user" component={User} />
    <Route exact path="/institution" component={Institution} />
  </div>
)
reactDom.render(
  <AppContainer>
    <ConfigProvider locale={zhCN}>
      {/* //<Provider> */}
      <HashRouter basename="" history={BrowserHistory}>
        <Switch>
          <Redirect exact from="/" to="/MonitoringModule" />
          <Route path="/" component={Parent} />
        </Switch>
      </HashRouter>
      {/* //</Provider> */}
    </ConfigProvider>
  </AppContainer>
  , document.getElementById('content'),
)
