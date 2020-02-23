import React from 'react'
import Loadable from 'react-loadable'
import { HashRouter, Route, BrowserHistory, Redirect, Switch } from 'react-router-dom'

import LoadingPage from './components/LoadingPage/LoadingPage'
import SystemMenu from './components/SystemMenu/SystemMenu'


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