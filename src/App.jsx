
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './App.css'
import ButtonInput from './components/Button'
import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import AppoinmentCard from './components/AppoinmentCard'
import DoctorDashboard from './pages/DoctorPage/DoctorDashboard'
import HealthOfficer from './pages/admin/HealthOfficer'
import SystemAdmin from './pages/admin/SystemAdmin'
import ServiceProvider from './pages/admin/ServiceProvider'
import ManageServiceCategoriesPage from './pages/admin/ManageServiceCategoriesPage'
import SystemAnalyticsPage from './pages/admin/SystemAnalyticsPage'
import ManageAllUsersPage from './pages/admin/ManageAllUsersPage'
import PatientDashboard from './components/PatientDashbord'

function App() {
  const route = createBrowserRouter(
    createRoutesFromElements(
    <>
     <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/appoint" element={<AppoinmentCard />} />
      <Route path="/heofficer" element={<HealthOfficer />} />
      <Route path="/system-admin" element={<SystemAdmin />} />
      <Route path="/service-provider" element={<ServiceProvider />} />
      <Route path="/service-provider" element={<ServiceProvider />} />
      <Route path="/manageService" element={<ManageServiceCategoriesPage />} />
      <Route path="/sysemAnalytic" element={<SystemAnalyticsPage />} />
      {/* <Route path="/mangeUser" element={<ManageAllUsersPage />} /> */}
      <Route path="/patientDash" element={<PatientDashboard />} />

     </Route>
      <Route path="/register" element ={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </>
    )
  )
  return <RouterProvider router={route} />
}

export default App
