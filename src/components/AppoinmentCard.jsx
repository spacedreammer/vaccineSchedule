import React from 'react'
import { Link } from 'react-router-dom'

const AppoinmentCard = () => {
  return (
    <>
    <div className='w-[12cm]'>
        <div className='grid grid-rows-2 bg-gray-50 font-poppins shadow-md rounded-md'>
            <div className='flex'>
            <h1>Appointments</h1>
            <Link to="#">see all</Link>
            </div>
           
           <div>
             {/* images */}
             <div className='flex w-[2cm] h-[2cm] rounded-full bg-gray-300 mb-5'>
                <img src="/images/girl1.jpeg" alt="doctor" className='w-full h-full rounded-full object-cover' />
            {/* Names */}
            <h2 className='text-center'>Zoe Smith</h2>
            </div>

           

            {/* dates and time */}
            <div><p>28/05/2025-15:32</p></div>

            {/* buttons */}
            <div>
                <h3>buttons</h3>
            </div>
           </div>


        </div>
    </div>
    </>
  )
}

export default AppoinmentCard