"use client";

import {  useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CarCard } from "./car-card";
import Link from "next/link";
import LoadingScreen from "./loading-screen";
import { AddCarDialog } from "./add-car";
import { useCarStore, useUserStore } from "@/lib/store";
import CarIcon from "@/public/car-icon.svg";
import Calendar from "@/public/calendar.svg";
import UserIcon from "@/public/user.svg";
import TakeAction from "./take-action";
import MonthEarnings from "./month-earnings";
import Customers from "./customers";
import KYCVerification from "./kyc-verification";
import RequestedBookings from "./requested-bookings";
import axios from "axios";
import { BASE_URL } from "@/lib/config";
import PausedCars from "./paused-cars";
import LoaderOverlay from "./loader-overlay";

export type PausedCar = {
  id: number;
  brand: string;
  model: string;
  plateNumber: string;
  colorOfBooking: string;
  status: string;
  photos:string[];
}

export function CarSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { cars } = useCarStore();
  const { name } = useUserStore();
  const [pausedCars,setPausedCars] = useState<PausedCar[]>([]);
  const [isPageLoading,setIsPageLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/car/paused/all`, {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPausedCars(res.data.cars);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);


  if (!cars) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-2">
      {isPageLoading && <LoaderOverlay />}
      <AddCarDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      {name ? (
        <div >
          {pausedCars.length > 0 && <PausedCars cars={pausedCars} setCars={setPausedCars}/>}
          <section className="py-6 bg-white bg-opacity-30 dark:bg-opacity-10 rounded-t-md backdrop-blur-lg sm:px-4 px-2">
            <div className="flex justify-between items-center sm:px-4 px-2">
                <h1
                  style={{ fontFamily: "var(--font-equinox), sans-serif" }}
                  className="sm:text-3xl text-xl font-bold"
                >
                  {name.split(" ")[0]}&apos;s GARRAGE
                </h1>
            </div>
            <div className="flex items-center gap-2 w-full px-4 mt-2 border-b border-border pb-3 mb-1">
              <div className="flex items-center gap-1 text-sm">
                <span
                  className="h-2 w-2 sm:h-3 sm:w-3 flex justify-center items-center text-xs p-1 text-center bg-blue-400 text-white rounded-full shadow-sm font-extrabold"
                  ></span>
                  <span>Upcoming</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span
                className="h-2 w-2 sm:h-3 sm:w-3 flex justify-center items-center text-xs p-1 text-center bg-green-400 text-white rounded-full shadow-sm font-extrabold"
                ></span>
                  <span>Ongoing</span>
              </div>
            </div>
            {cars.length > 0 ? (
              <div
                key={cars.length}
                className="grid z-0 grid-cols-2 mt-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3"
              >
                {cars.map((car) => (
                  <div key={car.id} onClick={() => setIsPageLoading(true)}>
                    <Link
                      href={`/car/${car.id}`}
                      key={car.id}
                      className="transform transition-all z-0 duration-300 hover:scale-105"
                    >
                      <CarCard
                        name={car.brand + " " + car.model}
                        imageUrl={car.imageUrl}
                        plateNumber={car.plateNumber}
                        color={car.colorOfBooking}
                        ongoingBooking={car.ongoingBooking}
                        upcomingBooking={car.upcomingBooking}
                        photos={car.photos}
                        status={car.status}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <CarIcon className="w-48 h-20 stroke-gray-400 fill-gray-400 mb-4 mb-4 stroke-[1px]" />
                <h1 className="text-center text-3xl mb-3 text-gray-400 font-bold">
                  Click below to add your first car
                </h1>
                <Button
                  className="bg-blue-600 text-white active:scale-95 dark:text-black hover:bg-opacity-80  shadow-lg"
                  onClick={() => setIsOpen(true)}
                >
                  <Plus className="text-20 h-60 w-60 stroke-[4px]" />
                </Button>
              </div>
            )}
          </section>
          <section className="py-6 my-1 bg-white bg-opacity-30 dark:bg-opacity-10 backdrop-blur-xl px-2 sm:px-4">
            <h1
              style={{ fontFamily: "var(--font-equinox), sans-serif" }}
              className="sm:text-3xl border-b border-border pb-5 mb-3 text-xl font-black font-myfont"
            >
              CARs INFO
            </h1>
            <div className="grid z-0 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:grid-cols-[minmax(400px,_1fr)_minmax(400px,_1fr)_1fr]">
              <TakeAction />
              <RequestedBookings/>
              <KYCVerification/>
              <MonthEarnings />
              <Customers/>
            </div>
          </section>
        </div>
      ) : (
        <section className="bg-white bg-opacity-30 mb-1 dark:bg-opacity-10 rounded-t-md backdrop-blur-lg sm:py-12 py-6 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center bg-card p-6 rounded-lg shadow-md">
                <CarIcon className="w-28 h-12 stroke-primary fill-primary mb-4 mb-4 stroke-[6px]" />
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Book your desired car with just a few clicks.
                </p>
              </div>
              <div className="flex flex-col items-center bg-card p-6 rounded-lg shadow-md">
                <Calendar className="w-12 h-12 stroke-primary fill-primary mb-4 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Calendar View</h3>
                <p className="text-muted-foreground">
                  Visualize all bookings in an intuitive calendar interface.
                </p>
              </div>
              <div className="flex flex-col items-center bg-card p-6 rounded-lg shadow-md">
                <UserIcon className="w-12 h-12 stroke-[20px] stroke-primary fill-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">User Profiles</h3>
                <p className="text-muted-foreground">
                  Manage your account and booking history with ease.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
