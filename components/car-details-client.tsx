"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, IndianRupee, Loader, LogOut,  Pause,  Play,  Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BackArrow from "@/public/back-arrow.svg";
import ArrowRight from "@/public/right_arrow.svg";
import axios from "axios";
import { BASE_URL } from "@/lib/config";
import LoadingScreen from "./loading-screen";
import Booking from "@/public/online-booking.svg";
import { useCarStore, useUserStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { uploadToDrive } from "@/app/actions/upload";
import CarIcon from "@/public/car-icon.svg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";


interface Car {
  id: number;
  brand: string;
  model: string;
  plateNumber: string;
  colorOfBooking: string;
  imageUrl: string;
  mileage: number;
  price: number;
  totalEarnings: number;
  carFolderId: string;
  seats: number;
  fuel: string;
  gear: string;
  status:string;
  photos:string[];
  bookings: {
    id: number;
    start: string;
    end: string;
    status: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerContact: string;
  }[];
}
interface Earnings {
  thisMonth: number;
  oneMonth: number;
  sixMonths: number;
}


export function CarDetailsClient({ carId }: { carId: number }) {
  const [car, setCar] = useState<Car | null>(null);
  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [color, setColor] = useState(car ? car.colorOfBooking : "#0000FF");
  const [price, setPrice] = useState(car?.price || 0);
  const [mileage, setMileage] = useState(car?.mileage || 0);
  const [imageUrl, setImageUrl] = useState<string[]>(car?.photos || []);
  const { cars, setCars } = useCarStore();
  const [earnings, setEarnings] = useState<Earnings>();
  const [action, setAction] = useState<
    "Delete booking" | "Update car" | "Delete car"
  >("Update car");
  const [deleteBookingId, setDeleteBookingId] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin,setIsAdmin] = useState(false);
  const [seats, setSeats] = useState<string>(car?.seats.toString() || "");
  const {userId} = useUserStore();
  const [fuel,setFuel] = useState<string>(car?.fuel || "");
  const [isPreviewOpen,setIsPreviewOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollValue,setScrollValue] = useState(0);
  const [previewImage,setPreviewImage] = useState<string | null>(null);
  const [gear,setGear] = useState<string>(car?.gear || "");
  const [status,setStatus] = useState<"active" | "pause">(car?.status as "active" | "pause" || "active");

  useEffect(() => {
    if (car) {
      setColor(car.colorOfBooking || "#0000FF");
      setPrice(car.price || 0);
      setMileage(car.mileage || 0);
      setImageUrl(car.photos || []);
      setSeats(car.seats.toString());
      setFuel(car.fuel);
      setPreviewImage(car.photos[0]);
      setGear(car.gear);
    }
  }, [car]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCar = await axios.get(`${BASE_URL}/api/v1/car/${carId}`, {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCar(resCar.data.car);
        setIsAdmin(resCar.data.isAdmin);
        const resEarnings = await axios.get(
          `${BASE_URL}/api/v1/car/earnings/${carId}`,
          {
            headers: {
              "Content-type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setEarnings({
          ...resEarnings.data.earnings,
          total: resEarnings.data.total,
        });
      } catch (error) {
        console.log(error);
        router.push("/car-not-found");
      }
    };
    fetchData();
  }, [carId,router]);

  if (!car) {
    return (
      <div>
        <LoadingScreen />
      </div>
    );
  }

  const handleScroll = (e:React.MouseEvent<HTMLDivElement, MouseEvent>,direction: "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    if (!scrollRef.current) return;
      if(direction === "left"){
        if(scrollValue !== 0) {
          setPreviewImage(car.photos[scrollValue-1]);
          setScrollValue(scrollValue - 1);
        }
      }else {
        if(scrollValue !== car.photos.length-1) {
          setPreviewImage(car.photos[scrollValue+1]);
          setScrollValue(scrollValue + 1);
        }
      }
  };

  function handleAction() {
    if (action === "Delete booking" && deleteBookingId !== 0) {
      handleDeleteBooking(deleteBookingId);
    } else if (action === "Update car") {
      handleUpdate();
    } else if (action === "Delete car") {
      handleDelete();
    }
    return;
  }

  const handleDelete = async () => {
    if (!isAdmin) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/api/v1/car/${car.id}`, {
        headers: {
          "Content-type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCars(cars.filter((c) => c.id !== car.id));
      toast({
        description: `Car Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
      });
      router.push("/");
      setIsDeleting(false);
    } catch (error) {
      console.log(error);
      toast({
        description: `Car failed to delete, please delete all bookings first`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isAdmin && userId !== 1) return;
    setIsLoading(true);
    const newImageUrl: string[]= [];

    try {
      // Upload image only if imageFile is provided
      if (imageFile) {
        for(const image of imageFile) {
          const resImage = await uploadToDrive(image, car.carFolderId);
          if (!resImage.url) throw new Error("Failed to upload image");
          newImageUrl.push(resImage.url);
        }
      }
      // Prepare data for update
      const updateData: Record<string, string | number | string[]> = {
        color: color,
        price: price,
        mileage: mileage,
        seats: parseInt(seats),
        fuel,
        gear,
      };

      if (newImageUrl.length > 0) {
        await axios.post(`${BASE_URL}/api/v1/car/upload/photos/${car.id}`, {
          urls: newImageUrl
        }, {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setImageUrl(newImageUrl);
      } else {
        setImageUrl(car?.photos || []);
      }

      await axios.put(`${BASE_URL}/api/v1/car/${car.id}`, updateData, {
        headers: {
          "Content-type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const carId = car.id;
      setCars(
        cars.map((car) => {
          if (car.id === carId) {
            const newCar: typeof car = {
              ...car,
              colorOfBooking: color,
              price,
              ...(imageUrl[0] && { imageUrl: imageUrl[0] }),
            };
            return newCar;
          } else {
            return car;
          }
        }),
      );
      setIsLoading(false);

      toast({
        description: `Car Successfully updated`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
      });
      setIsEditable(false);
    } catch (error) {
      console.log(error);
      toast({
        description: `Car failed to update`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditable(false);
    setColor(car.colorOfBooking || "#0000FF");
    setPrice(car.price || 0);
    setMileage(car.mileage || 0);
    setImageUrl(car?.photos || []);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const newFiles = [];
    const newUrls= [];
    if(files?.length && files.length > 10) {
        toast({
          description: `You can only upload upto 10 photos`,
          className:
            "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
          variant: "destructive",
          duration: 2000,
        });
    }
    if (files) {
      for(const file of files) {
        if (!file.type.startsWith("image/")) {
          return;
        }
        const maxSize = 10 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast({
            description: `File size should not exceed 5MB`,
            className:
              "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
            variant: "destructive",
            duration: 2000,
          });
          return;
        }
        newFiles.push(file);
        newUrls.push(URL.createObjectURL(file));
      }
      setImageFile(newFiles);
      setImageUrl(newUrls);
    }
  };

  function getHeader(
    status: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
  ) {
    let headerText = "";
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    const currDate = new Date();
    if (status === "Upcoming") {
      if (startDateTime >= currDate) {
        headerText = "Pickup scheduled on";
      } else {
        headerText = "Pickup was scheduled on";
      }
    } else if (status === "Ongoing") {
      if (endDateTime < currDate) {
        headerText = "Return was scheduled on";
      } else {
        headerText = "Return scheduled by";
      }
    } else if (status === "Completed") {
      headerText = "Booking ended at";
    }

    return headerText;
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getReturnTime(startDate: string, startTime: string,status:string) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const currDate = new Date();
    currDate.setHours(hours);
    currDate.setMinutes(status === "Upcoming" ? minutes-30 : minutes); // Subtract 30 minutes
  
    // Format back to HH:MM
    const newHours = currDate.getHours().toString().padStart(2, "0");
    const newMinutes = currDate.getMinutes().toString().padStart(2, "0");
  
    const pickup = new Date(startDate);
  
    if (newHours === "23" && Number(newMinutes) >= 30 && status === "Upcoming") {
      pickup.setDate(pickup.getDate() - 1); // Add a day
    }
  
    const date = pickup.toDateString().replaceAll(" ", ", ");
    return `${date} ${newHours}:${newMinutes}`;
  }

  function getTimeUntilBooking(startTime: string, status: string) {
    if (status === "Completed") return "Booking has ended";
    if (status === "Cancelled") return "Booking has been cancelled";
    if (status === "Ongoing") return "Booking has started";
    if( status === "Requested") return "Booking hasn't been confirmed";
    const now = new Date();
    const start = new Date(startTime);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0) return "Booking has started";
    if (diffDays === 0) return "Booking will start Today";
    if (diffDays === 1) return "Booking will start in 1 day";
    return `Booking will start in ${diffDays} days`;
  }

  async function handleDeleteBooking(bookingId: number) {
    //add code to delete the booking
    if (!isAdmin) return;
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/v1/booking/${bookingId}`,
        {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setCar((prev: Car | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          bookings: prev.bookings.filter((booking) => booking.id !== bookingId),
        };
      });
      toast({
        description: `Booking Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
      toast({
        description: `Booking failed to delete`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  const handleBookingAction = async () => {
    try{
      if(status === "active") {
        await axios.put(`${BASE_URL}/api/v1/car/${car.id}/action`, {
          action: "pause"
        },{
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStatus("pause");
      }else {
        await axios.put(`${BASE_URL}/api/v1/car/${car.id}/action`, {
          action: "active"
        },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStatus("active");
      }
    } catch (error) {
      console.log(error);
      toast({
        description: `Booking failed to update`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      }); 
    }
  }

  return (
    <div>
      {isDeleting && (
        <div className=" bg-black bg-opacity-80 fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center">
          <div className="flex space-x-2 justify-center items-center w-screen h-screen">
            <Loader/>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-700">
        <div
          className="mr-2 rounded-md font-bold  cursor-pointer hover:bg-gray-200 dark:hover:bg-muted"
          onClick={() => router.back()}
        >
          <div className="h-12 w-12 flex justify-center items-center rounded-full  ">
            <div className="h-9 w-9 p-1 rounded-full">
              <BackArrow className="h-7 w-7 stroke-0 fill-gray-800 dark:fill-blue-300" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg text-center font-semibold">{car?.brand} {car?.model}</h2>
          <p className="text-xs text-center">Car ID: {car?.id}</p>
        </div>
        
        {(isAdmin || userId === 1 )? (
        <div
          className="mr-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-muted p-2 rounded-sm"
          onClick={() => {
            setAction("Delete car");
            setIsDialogOpen(true);
          }}
        >
          <Trash2 className=" h-6 w-6" />
        </div>
        ) : (
          <div className="text-center w-5 h-5"></div>
          )}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row gap-2 sm:border-b border-border h-full items-center">
          <div className=" flex flex-col  px-1 justify-center sm:py-4 items-center w-full h-full">
            <div className="relative w-full max-sm:px-2  my-2 h-full">
              <div 
              onClick={() => {
                setIsPreviewOpen(true);
              }}
              className="h-[240px] sm:h-[275px] cursor-pointer sm:mx-2 grid grid-cols-3 p-1 gap-1 border-2 border-black/20 dark:border-white/30 rounded-md">
                <Image
                  src={imageUrl[0] || "/placeholder.svg"}
                  alt={`${car.brand} ${car.model}`}
                  width={2000}
                  height={1000}
                  className={cn("col-span-2 rounded-md h-[230px] sm:h-[265px] max-w-full max-h-full object-cover",
                    imageUrl.length < 2 && "col-span-3"
                  )}
                />
                {imageUrl.length >= 2 && 
                <div className="w-full h-[225px] sm:h-[260px] flex flex-col gap-1 rounded-r-md">
                  {imageUrl[1] &&
                  <div className="w-full h-1/2 max-h-full rounded-r-md">
                      <Image
                        src={imageUrl[1] || "/placeholder.svg"}
                        alt={`${car.brand} ${car.model}`}
                        width={2000}
                        height={1000}
                        className="h-full max-h-full w-full object-cover rounded-r-md"
                      />
                  </div>
                      }
                  {imageUrl[2] &&
                  <div className="w-full relative h-1/2 max-h-full rounded-r-md">
                      <Image
                        src={imageUrl[2] || "/placeholder.svg"}
                        alt={`${car.brand} ${car.model}`}
                        width={2000}
                        height={1000}
                        className="h-full w-full max-h-full object-cover rounded-r-md"
                      />
                      <div className="w-full absolute text-white inset-0 h-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                        <span>+{imageUrl.length - 2} more</span>
                      </div>
                  </div>
                      }
                </div>
                }
              </div>
              {isEditable && (
                <button
                  onClick={() => document.getElementById("carImage")?.click()}
                  className="absolute active:scale-95 top-2 right-2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Edit size={20} />
                  <Input
                    id="carImage"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </button>
              )}
            </div>
            <div className="flex justify-center w-full">
              { (userId === 1 || isAdmin) &&
              <>
                {!isEditable ? (
                  <Button
                    onClick={() => setIsEditable(true)}
                    className="bg-primary active:scale-95 text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Edit size={20} />
                    <span>Edit Car Details</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      disabled={isLoading}
                      onClick={() => {
                        setAction("Update car");
                        setIsDialogOpen(true);
                      }}
                      className={`mx-3 flex active:scale-95 items-center bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors ${isLoading && "cursor-not-allowed opacity-50"}`}
                    >
                      {isLoading ? (
                        <>
                          <span className="text-white">Please wait</span>
                          <div className="flex items-end py-1 h-full">
                            <span className="sr-only">Loading...</span>
                            <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-1 w-1 bg-white mx-[2px] border-border rounded-full animate-bounce"></div>
                          </div>
                        </>
                      ) : (
                        <span>Update</span>
                      )}
                    </Button>
                    {!isLoading && (
                      <Button
                        onClick={() => handleCancel()}
                        className="mx-3 bg-secondary active:scale-95 text-secondary-foreground p-2 rounded-md hover:bg-secondary/90 transition-colors"
                      >
                        <span>Cancel</span>
                      </Button>
                    )}
                  </>
                )}
              </>
              }
            </div>
          </div>
          <div className="w-full h-full sm:border-l border-border">
            <div className="">
              <section className="px-2 py-2 pb-0 max-sm:border-t border-gray-200 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold mb-4 ">Car Details</h2>
                  <Button 
                  onClick={handleBookingAction}
                  className="active:scale-95 rounded-full py-1 text-white px-2">
                    {status === "active" ?
                    <>
                      <Pause className="w-6 h-6"/>
                      <span>Pause</span>
                    </>
                    :
                    <>
                      <Play className="w-6 h-6"/>
                      <span>Resume</span>
                    </>
                    }
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 ">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-500 mb-1">Brand</p>
                    <span className="font-medium">{car.brand}</span>
                    <p className="text-sm text-blue-500 mb-1">Model</p>
                    <span className="font-medium">{car.model}</span>
                    <div>
                      <p className="text-sm text-blue-500 mb-1">Seats</p>
                      {!isEditable ?
                        <span className="font-medium">{seats}</span>
                      :
                      <Input
                            type="number"
                            id="seats"
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                            className="w-[80px] border-0 p-0 px-1 m-0 bg-gray-200 dark:bg-zinc-800 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                          />
                      }
                    </div>
                    <div>
                      <p className="text-sm text-blue-500 mb-1">Transmission</p>
                      {!isEditable || !isAdmin && userId !== 1 ? 
                        <>
                        {gear &&
                        <span className="font-medium">{gear[0].toUpperCase() + gear.slice(1)}</span>} 
                        </>
                      :
                      <Select
                        value={gear} // Ensures placeholder shows when carId is 0 or undefined
                        onValueChange={(value) => {
                          setGear(value)
                        }}
                      >
                        <SelectTrigger
                          id="car"
                          className="w-1/2 text-xs sm:text-sm border-black dark:border-zinc-700 focus:border-blue-400 focus-visible:ring-blue-400 max-sm:max-w-[190px] focus-visible:ring-blue-400 focus:outline-none"
                        >
                          <SelectValue placeholder="Select gear" />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-background border-border"
                          aria-modal={false}
                        >
                          <SelectItem
                            className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                            value={"manual"}
                          >
                            Manual
                          </SelectItem>
                          <SelectItem
                            className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                            value={"auto"}
                          >
                            Automatic
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      }
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-500">
                        {isEditable && isAdmin
                          ? "Select the Color of Booking"
                          : "Color of Bookings"
                          }
                      </p>
                      <div className="flex flex-col item-center gap-1 max-w-[214px] w-full">
                        <div
                          className={`w-8 h-8 rounded-md border border-gray-300 dark:border-zinc-700 ${isEditable ? "cursor-pointer" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            isEditable &&
                            document.getElementById("colorPicker")?.click()
                          }
                        />
                        <Input
                          type="color"
                          id="colorPicker"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="hidden my-0"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-blue-500 mb-1">Plate Number</p>
                    <span className="font-medium">{car.plateNumber}</span>
                    <div>
                      <p className="text-sm text-blue-500 mb-1">Fuel</p>
                      {!isEditable || !fuel || !isAdmin && userId !== 1 ? 
                        <>
                        {fuel &&
                        <span className="font-medium">{fuel[0].toUpperCase() + fuel.slice(1)}</span>} 
                        </>
                      :
                      <Select
                        value={fuel} // Ensures placeholder shows when carId is 0 or undefined
                        onValueChange={(value) => {
                          setFuel(value)
                        }}
                      >
                        <SelectTrigger
                          id="car"
                          className="w-1/2 text-xs sm:text-sm border-black dark:border-zinc-700 focus:border-blue-400 focus-visible:ring-blue-400 max-sm:max-w-[190px] focus-visible:ring-blue-400 focus:outline-none"
                        >
                          <SelectValue placeholder="Select fuel" />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-background border-border"
                          aria-modal={false}
                        >
                          <SelectItem
                            className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                            value={"petrol"}
                          >
                            Petrol
                          </SelectItem>
                          <SelectItem
                            className="focus:bg-blue-300 dark:focus:bg-blue-900 cursor-pointer"
                            value={"diesel"}
                          >
                            Diesel
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      }
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <hr className="my-4 border-gray-200 dark:border-zinc-700" />
            <section className="px-2 py-2 max-sm:border-b-4 border-gray-200 dark:border-zinc-700">
                <h2 className="text-xl font-semibold mb-4">
                  Performance & Pricing
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-500 mb-1">24hr Price</p>
                      {!isEditable || !price || !isAdmin && userId !== 1 ? (
                        <span className="font-medium flex items-center text-sm">
                          <IndianRupee className="w-4 h-4" /> {car.price}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          id="name"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-[120px] sm:w-[170px] border-0 p-0 px-1 bg-gray-200 dark:bg-zinc-800 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                        />
                      )}
                    </div>
                    {earnings && earnings.oneMonth != 0 && (
                      <div>
                        <p className="text-sm text-blue-500 mb-1">
                          1 month Earnings
                        </p>
                        <span className="font-medium flex items-center text-sm">
                          <IndianRupee className="w-4 h-4" />{" "}
                          {earnings.oneMonth}{" "}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-blue-500 mb-1">Mileage</p>
                      {!isEditable || !mileage || !isAdmin && userId !== 1  ? (
                        <span className="font-medium">{car.mileage} km/ltr</span>
                      ) : (
                        <Input
                          type="number"
                          id="name"
                          value={mileage}
                          onChange={(e) => setMileage(Number(e.target.value))}
                          className="w-[120px] sm:w-[170px] border-0 p-0 px-1 bg-gray-200 dark:bg-zinc-800 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {earnings && earnings.thisMonth != 0 && earnings.thisMonth && (
                      <div>
                        <p className="text-sm text-blue-500 mb-1">
                          This Month Earnings
                        </p>
                        <span className="font-medium flex items-center text-sm">
                          <IndianRupee className="w-4 h-4" />
                          {earnings.thisMonth}
                        </span>
                      </div>
                    )}
                    {earnings && earnings.sixMonths != 0 && earnings.sixMonths && (
                      <div>
                        <p className="text-sm text-blue-500 mb-1">
                          6 Month Earnings
                        </p>
                        <span className="font-medium flex items-center text-sm">
                          <IndianRupee className="w-4 h-4" />
                          {earnings.sixMonths}
                        </span>
                      </div>
                    )}
                    {car && car.totalEarnings != 0 && car.totalEarnings && (
                      <div>
                        <p className="text-sm text-blue-500 mb-1">Total Earnings</p>
                        <span className="font-medium flex items-center text-sm">
                          <IndianRupee className="w-4 h-4" />
                          {car.totalEarnings}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
            </section>
          </div>
        </div>
          <section className="px-4 py-4 ">
            <h2 className="text-xl font-semibold mb-4">Current Bookings</h2>
            {car.bookings.length > 0 ? (
              <div key={car.id} className=" gap-8 mb-4">
                {car.bookings.map((booking) => {
                  if (booking.status === "Completed") return;
                  return (
                    <Card
                      key={booking.id}
                      className="overflow-hidden hover:shadow-md dark:border-zinc-700 transition-shadow my-2"
                    >
                      <CardContent className="p-0">
                        {/* Rest of the card content remains the same */}
                        <div className="flex justify-between items-center p-1 sm:p-2 bg-muted">
                          <div className="">
                            <p className="text-sm max-sm:text-xs text-blue-500">
                              {getHeader(
                                booking.status,
                                booking.start,
                                booking.startTime,
                                booking.end,
                                booking.endTime,
                              )}
                            </p>
                            <p className="font-semibold text-[#5B4B49] max-sm:text-sm dark:text-gray-400">
                              {getReturnTime(booking.end, booking.endTime,booking.status)}{" "}
                            </p>
                          </div>
                          <div className="flex items-center ml-2 gap-[2px] sm:gap-2 justify-center">
                            <span className="text-blue-500 max-sm:text-xs">Go to Booking</span>
                            <LogOut
                              onClick={() =>
                                router.push("/booking/" + booking.id)
                              }
                              className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                            />
                          </div>
                        </div>
                        <hr className="border-t border-border" />
                        <div className="p-4 max-sm:p-2 bg-white dark:bg-background flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center sm:gap-8 gap-2">
                              <div>
                                <p className="text-xs sm:text-sm text-blue-500">
                                  From
                                </p>
                                <p className="font-semibold text-[#5B4B49] text-xs sm:text-sm dark:text-gray-400">
                                  {formatDateTime(booking.start)}{" "}
                                  {booking.startTime}
                                </p>
                              </div>
                              <ArrowRight className="mt-4 w-12 stroke-0 fill-blue-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs sm:text-sm text-blue-500">
                                  To
                                </p>
                                <p className="font-semibold text-[#5B4B49] text-xs sm:text-sm dark:text-gray-400">
                                  {formatDateTime(booking.end)}{" "}
                                  {booking.endTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center w-full sm:w-4/5 justify-between mt-2 sm:mt-8 sm:gap-8 gap-2">
                              <div>
                                <p className="text-xs sm:text-sm text-blue-500">
                                  Booked By
                                </p>
                                <p className="font-semibold text-[#5B4B49] text-xs sm:text-sm dark:text-gray-400">
                                  {booking.customerName}
                                </p>
                              </div>
                              <div>
                                <p className="sm:text-sm text-xs text-blue-500">
                                  Contact
                                </p>
                                <p className="font-semibold text-[#5B4B49] text-xs sm:text-sm dark:text-gray-400">
                                  {booking.customerContact}
                                </p>
                              </div>
                            </div>
                          </div>
                          {isAdmin ? 
                          <div
                            className="text-center ml-4"
                            onClick={() => {
                              setDeleteBookingId(booking.id);
                              setAction("Delete booking");
                              setIsDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 sm:h-6 sm:w-6 hover:text-red-500" />
                          </div>
                          :
                          <div className="w-4 h-4 sm:h-6 sm:w-6 "/>
                          }
                        </div>
                        <div className="p-3 max-sm:p-2 flex bg-gray-200 dark:bg-muted items-center text-green-600 dark:text-green-400 gap-2">
                          <CarIcon className="w-8 h-3 stroke-green-600 dark:stroke-green-400 fill-green-600 dark:fill-green-400 stroke-[4px]" />
                          <p className="text-sm max-sm:text-xs ">
                            {getTimeUntilBooking(booking.start, booking.status)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full h-full">
                <div className="w-full h-full flex mt-4 flex-col justify-center items-center">
                  <Booking
                    className={`h-12 w-12 stroke-[5px] fill-gray-400 `}
                  />
                  <p className="text-center text-xl text-gray-400 font-bold">
                    No Bookings Yet
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <AlertDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <AlertDialogContent className="max-w-3xl border-border max-sm:py-2 max-sm:px-0 z-[999]">
        <AlertDialogHeader>
          <AlertDialogTitle>Photos Preview</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <div 
        ref= {scrollRef}
        className="relative flex justify-center">
          {imageUrl && previewImage && (
          <>
            <Image
                src={previewImage || "/placeholder.svg"}
                alt={`${car.brand} ${car.model}`}
                width={2000}
                height={1000}
                className=" max-h-[85vh] sm:max-h-[60vh] w-full object-cover sm:w-[70%]"
              />
              <div className="absolute bottom-0 left-0 w-full h-fit flex items-center justify-center">
                <div className="flex justify-center items-end h-fit gap-1">
                  {imageUrl.map((image,index) => (
                    <div key={index+image} 
                    onClick={() => {
                      setPreviewImage(image);
                      setScrollValue(index)
                    }}
                    className={`${scrollValue===index ? "w-4 h-4 bg-white" : "w-3 h-3 bg-blue-400"} cursor-pointer border-2 border-blue-400 rounded-full transition-all duration-300 ease-in-out`}/>
                  ))}
                </div>
              </div>
              <div 
                onClick={(e) => handleScroll(e,"left")} 
                className="absolute border border-transparent active:scale-[0.95] top-0 opacity-60 hover:opacity-100 -left-3 flex items-center justify-center h-full rounded-sm">
                    <ChevronLeft
                    className="w-12 h-12 p-0 text-blue-400"/>
                </div>
              <div 
                onClick={(e) => handleScroll(e,"right")} 
                className="absolute border border-transparent active:scale-[0.95] top-0 opacity-60 hover:opacity-100 -right-3 flex items-center justify-center h-full rounded-sm">
                    <ChevronRight className="w-12 h-12 p-0 text-blue-400 "/>
              </div>
          </>
          )}
        </div>
        <AlertDialogFooter className="flex flex-row justify-center w-full">
          <AlertDialogAction className="select-none max-sm:w-1/2">Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
     
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-muted border-border ">
          <DialogHeader>
            <DialogTitle>{action.split(" ")[0]}</DialogTitle>
            <DialogDescription className="text-blue-500">
              Are you sure you want to {action}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="max-sm:w-full active:scale-95 hover:bg-black bg-black hover:bg-opacity-80 text-white  shadow-lg"
              onClick={() => {
                handleAction();
                setIsDialogOpen(false);
              }}
            >
              {action.split(" ")[0]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
