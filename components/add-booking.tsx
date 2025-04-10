"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Price from "@/public/price-tag.svg";
import { DatePicker } from "./ui/datepicker";
import AddTime from "./add-time";
import CarFrontIcon from "@/public/car-front.svg";
import UserIcon from "@/public/user.svg";
import Delivery from "@/public/delivery.svg";
import Calendar from "@/public/date-and-time.svg";
import Rupee from "@/public/rupee-symbol.svg";
import Advance from "@/public/advance.svg";
import Booking from "@/public/online-booking.svg";
import axios from "axios";
import { BASE_URL } from "@/lib/config";
import { Car } from "@/lib/store";
import { Booking as BookingType } from "@/app/bookings/page";
import { toast } from "@/hooks/use-toast";
import CustomerName from "./customer-name";

interface FormErrors {
  [key: string]: string;
}

interface Customer {
  id: number;
  name: string;
  contact: string;
  address: string;
  imageUrl: string;
  folderId: string;
}

export function calculateCost(
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string,
  pricePer24Hours: number,
) {
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  startDateTime.setHours(startHour, startMinute, 0, 0);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  const timeDifference = endDateTime.getTime() - startDateTime.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  const cost = (hoursDifference / 24) * pricePer24Hours;

  return Math.floor(cost);
}
export function AddBookingDialog({
  isOpen,
  setIsOpen,
  cars,
  setBookings,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cars: Car[];
  setBookings?: React.Dispatch<React.SetStateAction<BookingType[]>>;
}) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [carId, setCarId] = useState<number>(cars[0] ? cars[0].id : 0);
  const [price, setPrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState<number>();
  const [customers, setCustomers] = useState<Customer[]>();
  const [advance, setAdvance] = useState<number>(0);
  const [type, setType] = useState<"pickup" | "home delivery">("pickup");

  useEffect(() => {
    const cost = calculateCost(startDate, endDate, startTime, endTime, price);
    setTotalAmount(cost);
  }, [price, startDate, endDate, startTime, endTime]);

  useEffect(() => {
    if (carId === 0) return;
    const currCar = cars.find((car) => car.id === carId);
    if (currCar) {
      setPrice(currCar.price);
    }
  }, [carId, cars]);

  const validateDate = () => {
    if (startDate < endDate) return true;

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    startDateTime.setHours(startHour, startMinute, 0, 0);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    return startDateTime < endDateTime;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (price === 0) newErrors.price = "Price can't be zero";
    if (totalAmount === 0) newErrors.totalAmount = "Total Amount can't be zero";
    if (!startDate) newErrors.startDate = "This field is mandatory";
    if (!endDate) newErrors.endDate = "This field is mandatory";
    if (carId === 0) newErrors.car = "Please select a car";
    if (name === "") newErrors.name = "This field is mandatory";
    if (contact === "") newErrors.contact = "This field is mandatory";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/customer/all`, {
          headers: {
            authorization: `Bearer ` + localStorage.getItem("token"),
          },
        });
        setCustomers(res.data.customers);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("submitted")
    if (!validateForm()) {
      toast({
        description: `Please fill all mandatory fields`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      setErrors((prev) => ({ ...prev, startDate: "Enter correct start date" }));
      return;
    }

    if (!validateDate()) {
      toast({
        description: `Start date can't be equal or before End date`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      setErrors((prev) => ({
        ...prev,
        startDate: "Start date can't be equal or after end date",
      }));
      return;
    }
    setIsLoading(true);

    try {
      if (customers) {
        const customer = customers.find((customer) => {
          return customer.name === name && customer.contact === contact;
        });
        if (!customer) {
          setCustomerId(undefined);
        }
      }

      const res = await axios.post(
        `${BASE_URL}/api/v1/booking`,
        {
          startDate: startDate.toLocaleDateString("en-US"),
          endDate: endDate.toLocaleDateString("en-US"),
          startTime: startTime,
          endTime: endTime,
          allDay: false,
          carId,
          customerName: name,
          customerContact: contact,
          dailyRentalPrice: price,
          totalAmount: totalAmount,
          type,
          customerId: customerId,
          advance
        },
        {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ` + localStorage.getItem("token"),
          },
        },
      );

      const car = cars.find((car) => car.id === carId);

      const newBooking: BookingType = {
        id: res.data.bookingId,
        start: startDate.toLocaleDateString("en-US"),
        end: endDate.toLocaleDateString("en-US"),
        startTime: startTime,
        endTime: endTime,
        carId,
        customerName: name,
        customerContact: contact,
        carImageUrl: car?.imageUrl || "",
        carName: car?.brand + " " + car?.model,
        carPlateNumber: car?.plateNumber || "",
        carColor: car?.colorOfBooking || "",
        status: "Upcoming",
        type,
        isAdmin:true,

        otp:''
      };

      setIsOpen(false);
      if(setBookings) setBookings((prev: BookingType[]) => {
        return [...prev, newBooking];
      });

      setIsLoading(false);
      handleClear(event);
      toast({
        description: `Booking Successfully created`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast({
        description: `Booking failed to create`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDateChange = (type: string) => {
    if (type === "start") {
      setErrors((prev) => ({ ...prev, startDate: "" }));
    } else if (type === "end") {
      setErrors((prev) => ({ ...prev, endDate: "" }));
    }
  };

  const handleClear = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("00:00");
    setEndTime("00:00");
    setName("");
    setContact("");
    setCarId(0);
  };

  return (
    <>
      <div
        className={`${isOpen ? "" : "hidden"} fixed top-0 left-0 h-screen w-screen z-10 bg-opacity-5 backdrop-blur-sm`}
      ></div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] max-sm:p-2 py-4 bg-white dark:bg-muted dark:border-zinc-700 md:max-w-[600px] h-[82vh] sm:top-[55%] sm:h-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mt-30 text-blue-700 dark:text-blue-600">
              <Booking className="w-6 h-6 flex-shrink-0 stroke-[6px] stroke-blue-600 fill-blue-600" />
              Add Booking
            </DialogTitle>
          </DialogHeader>
          <form  className="space-y-2">
            <div className="flex items-center gap-4">
              <CarFrontIcon className="w-6 h-4 dark:stroke-blue-200 dark:fill-blue-200 stroke-[6px] stroke-black fill-black flex-shrink-0" />
              <Label htmlFor="car" className="w-1/3">
                Select your car
              </Label>

              <Select
                value={carId != 0 ? carId.toString() : undefined} // Ensures placeholder shows when carId is 0 or undefined
                onValueChange={(value) => {
                  setCarId(Number(value));
                  setErrors((prev) => ({ ...prev, car: "" }));
                }}
              >
                <SelectTrigger
                  id="car"
                  className="w-2/3 border-input focus:border-blue-400 focus:ring-blue-400 max-sm:max-w-[190px] focus-visible:ring-blue-400 focus:outline-none"
                >
                  <SelectValue placeholder="Select a car" />
                </SelectTrigger>
                <SelectContent
                  className="bg-background border-border"
                  aria-modal={false}
                >
                  {cars &&
                    cars.length > 0 &&
                    cars.map((car) => (
                      <SelectItem
                        key={car.id}
                        className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                        value={car.id.toString()}
                      >
                        {car.brand + " " + car.model}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {errors.car && (
                <p className="text-red-500 text-sm mt-1">{errors.car}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 flex-shrink-0 fill-black dark:fill-white stroke-black dark:stroke-white stroke-[1px]" />
                <Label className="w-1/3">Select date and time</Label>
              </div>
              <div className="flex items-center gap-2 ml-9">
                <Label htmlFor="fromDate" className="w-1/6">
                  From
                </Label>
                <div>
                  <div className="flex space-x-4">
                    <div className="">
                      <DatePicker
                        className="max-sm:w-[120px]"
                        date={startDate}
                        setDate={setStartDate}
                        handleDateChange={handleDateChange}
                        dateType="start"
                      />
                    </div>
                    <div className=" mx-2">
                      <AddTime
                        className="max-sm:px-4 px-2 w-fit"
                        selectedTime={startTime}
                        setSelectedTime={setStartTime}
                      />
                      <input type="hidden" name="time" value={startTime} />
                    </div>
                  </div>
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-9">
                <Label htmlFor="toDate" className="w-1/6">
                  To
                </Label>
                <div>
                  <div className="flex space-x-4">
                    <div className="">
                      <DatePicker
                        className="max-sm:w-[120px]"
                        date={endDate}
                        setDate={setEndDate}
                        handleDateChange={handleDateChange}
                        dateType="end"
                      />
                    </div>
                    <div className=" mx-2">
                      <AddTime
                        className="max-sm:px-4 px-2 w-fit"
                        selectedTime={endTime}
                        setSelectedTime={setEndTime}
                      />
                      <input type="hidden" name="time" value={endTime} />
                    </div>
                  </div>
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UserIcon className="h-5 w-5 flex-shrink-0 stroke-[12px] stroke-black fill-black dark:stroke-white dark:fill-white" />
              <div className="flex w-full gap-2 sm:gap-4">
                <div>
                  <Label htmlFor="name" className="w-1/3">
                    Customer Name
                  </Label>
                  <CustomerName
                    name={name}
                    contact={contact}
                    onChangeInput={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    customerId={customerId}
                    customers={customers}
                    setName={setName}
                    setCustomerId={setCustomerId}
                    setContact={setContact}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name" className="w-1/3">
                    Contact
                  </Label>
                  <Input
                    value={contact}
                    type="number"
                    id="contact"
                    maxLength={9999999999}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        setContact(e.target.value);
                        setErrors((prev) => ({ ...prev, contact: "" }));
                      }
                    }}
                    className="w-2/3 border-input max-sm:text-xs max-sm:placeholder:text-xs sm:min-w-[130px] w-full focus:border-blue-400 focus-visible:ring-blue-400 
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                "
                  />

                  {errors.contact && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contact}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
            <Delivery className="h-6 w-6 flex-shrink-0 stroke-[12px] stroke-black fill-black dark:stroke-white dark:fill-white" />
              <Label htmlFor="car" className="w-1/3">
                Delivery Type
              </Label>
              <Select
                value={type} // Ensures placeholder shows when carId is 0 or undefined
                onValueChange={(value) => {
                  setType(value as "pickup" | "home delivery");
                  setErrors((prev) => ({ ...prev, type: "" }));
                }}
              >
                <SelectTrigger
                  id="car"
                  className="w-2/3 border-input focus:border-blue-400 focus:ring-blue-400 max-sm:max-w-[190px] focus-visible:ring-blue-400 focus:outline-none"
                >
                  <SelectValue placeholder="Select delivery" />
                </SelectTrigger>
                <SelectContent
                  className="bg-background border-border"
                  aria-modal={false}
                >
                    <SelectItem
                      className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                      value="pickup"
                    >
                      Pick Up
                    </SelectItem>
                    <SelectItem
                      className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                      value="home delivery"
                    >
                      Home Delivery
                    </SelectItem>
                </SelectContent>
              </Select>

              {errors.car && (
                <p className="text-red-500 text-sm mt-1">{errors.car}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Price className="h-6 w-6 mr-[-2px] flex-shrink-0 stroke-[12px] stroke-black fill-black dark:stroke-white dark:fill-white" />
              <Label htmlFor="price" className="w-1/3">
                24 hr price
              </Label>
              <Input
                type="text"
                id="price"
                className="w-2/3 border-input max-sm:text-xs  focus:border-blue-400 focus-visible:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={price}
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setPrice(Number(value));
                    setErrors((prev) => ({ ...prev, price: "" }));
                  }
                }}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Rupee className="h-6 w-6 mr-[-2px] flex-shrink-0 stroke-[2px] stroke-black fill-black dark:stroke-white dark:fill-white" />
              <Label htmlFor="totalAmount" className="w-1/3">
                Total amount
              </Label>
              <Input
                type="number"
                id="totalAmount"
                value={totalAmount || 0}
                readOnly
                className="w-2/3 max-sm:text-xs cursor-not-allowed focus-visible:ring-0  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {errors.totalAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.totalAmount}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Advance className="h-6 w-6 mr-[-2px] flex-shrink-0 stroke-[2px] stroke-black fill-black dark:stroke-white dark:fill-white" />
              <Label htmlFor="advance" className="w-1/3">
                Advance Payment
              </Label>
              <Input
                type="text"
                id="price"
                className="w-2/3 border-input max-sm:text-xs  focus:border-blue-400 focus-visible:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={advance}
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setAdvance(Number(value));
                    setErrors((prev) => ({ ...prev, advance: "" }));
                  }
                }}
              />
              {errors.advance && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.advance}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`bg-blue-600 active:scale-95 dark:text-white hover:bg-opacity-80 w-full ${isLoading && "cursor-not-allowed opacity-50"}`}
              >
                {isLoading ? (
                  <>
                    <span>Please wait</span>
                    <div className="flex items-end py-1 h-full">
                      <span className="sr-only">Loading...</span>
                      <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce"></div>
                    </div>
                  </>
                ) : (
                  <span>Create</span>
                )}
              </Button>
              {!isLoading && (
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="border active:scale-95 border-input w-full"
                >
                  Clear
                </Button>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault()
                setIsOpen(false)
              }}
              className="border active:scale-95 border-input w-full sm:hidden w-full"
            >
              Cancel
            </Button> 
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
