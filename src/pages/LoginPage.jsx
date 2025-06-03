import React from 'react'
import ImageSlider from '../components/ImageSlider'
import { Link } from 'react-router-dom'
import RegisterPage from './RegisterPage'
const LoginPage = () => {
  return (
    <>
     <div className='bg-gray-100 font-poppins shadow-md rounded-md mt-28 p-10'>

<div className='grid grid-cols-2 gap-3 p-5 '>
    {/* image */}
    <div>
        <ImageSlider />
        {/* <img src={bb} alt="register" className='w-[10cm] h-[10cm] rounded-md object-cover' /> */}
    </div>

    {/* create account */}
    <div className=''>
        <div className='flex flex-col items-center justify-center'>
            <h2 className='pb-3'>Don't have an Account? <Link to="/register" className='text-cyan-300 text-xl'>Register</Link> </h2>
        <h1 className='mb-3'>Login </h1>
        <form className='flex flex-col gap-3 mt-8'>
            <div className='grid grid-cols-2 gap-3'>
           
            </div>
            <input type="email" placeholder='Email' className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none' />
            <input type="password" placeholder='Password' className='border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring-gray-300 outline-none' />
           <button type="submit" className='bg-gray-500 text-white  p-2 rounded-md hover:bg-cyan-300'>Login</button>
        </form>
        </div>
    </div>
</div>
</div>
    </>
  )
}

export default LoginPage