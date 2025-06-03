
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './App.css'
import ButtonInput from './components/Button'
import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DoctorPage from './pages/DoctorPage'
import AppoinmentCard from './components/AppoinmentCard'

function App() {
  const route = createBrowserRouter(
    createRoutesFromElements(
    <>
     <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/doctor" element={<DoctorPage />} />
      <Route path="/appoint" element={<AppoinmentCard />} />
     </Route>
      <Route path="/register" element ={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
    </>
    )
  )
  return <RouterProvider router={route} />
}

export default App
