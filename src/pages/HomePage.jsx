import React from "react";
import Hero from "../components/Hero";
import healingStart from "../assets/images/healingStart.avif";
import bb from "../assets/images/bb.avif";
import Buton from "../components/Button";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <Hero />

      <div className="grid grid-cols-2 gap-3 pt-2 ">
        <img
          src={healingStart}
          alt="healing"
          className="w-[10cm] h-[10cm] rounded-md"
        />

        <div className="font-poppins">
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam,
            architecto. Est corporis perspiciatis, distinctio, et maiores
            repellat ipsam suscipit praesentium minus enim velit. Harum beatae
            quam assumenda veritatis! Assumenda, est. Lorem ipsum dolor sit,
            amet consectetur adipisicing elit. Ullam, architecto. Est corporis
            perspiciatis, distinctio, et maiores repellat ipsam suscipit
            praesentium minus enim velit. Harum beatae quam assumenda veritatis!
            Assumenda, est.
          </p>
          <Link to={'/login'}>
            
            <Buton
              text="Appointment"
              className="bg-blue-200 w-[6cm] text-white my-5"
            />
          </Link>
        </div>

        <p className="font-poppins">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam,
          architecto. Est corporis perspiciatis, distinctio, et maiores repellat
          ipsam suscipit praesentium minus enim velit. Harum beatae quam
          assumenda veritatis! Assumenda, est. Lorem ipsum dolor sit, amet
          consectetur adipisicing elit. Ullam, architecto. Est corporis
          perspiciatis, distinctio, et maiores repellat ipsam suscipit
          praesentium minus enim velit. Harum beatae quam assumenda veritatis!
          Assumenda, est.
        </p>

        <img src={bb} alt="healing" className="w-[10cm] h-[10cm] rounded-md" />
      </div>
    </>
  );
};

export default HomePage;
