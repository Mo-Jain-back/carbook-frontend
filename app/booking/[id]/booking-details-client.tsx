import { Button } from "@/components/ui/button";
import { Edit,  MoreVertical, Share, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DatePicker } from "@/components/ui/datepicker";
import AddTime from "@/components/add-time";
import ArrowRight from "@/public/right_arrow.svg";
import Cancel from "@/public/cancel.svg";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackArrow from "@/public/back-arrow.svg";
import { StatusInput } from "@/components/ui/status-input";
import CarIcon from "@/public/car-icon.svg";
import axios from "axios";
import { BASE_URL } from "@/lib/config";
import { Booking, CarImage, Document } from "./page";
import ActionDialog from "@/components/action-dialog";
import { calculateCost } from "@/components/add-booking";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { RenderFileList, RenderNewFileList } from "./render-file-list";
import { uploadToDrive } from "@/app/actions/upload";
import BookingStop from "@/components/booking-stop";
import { useEventStore } from "@/lib/store";
import ExportIcon from "@/public/File export.svg"
import ExportButton from "@/components/export-button";
import Loader from "@/components/loader";
import MailDialog from "@/components/mail-dialog";

interface BookingDetailsClientProps {
  booking: Booking;
  isAdmin: boolean;
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FormErrors {
  [key: string]: string;
}

export function BookingDetailsClient({ booking,isAdmin }: BookingDetailsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [startDate, setStartDate] = useState(new Date(booking.start));
  const [endDate, setEndDate] = useState(new Date(booking.end));
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime, setEndTime] = useState(booking.endTime);
  const [bookingStatus, setBookingStatus] = useState(booking.status);
  const [action, setAction] = useState<string>("Start");
  const [name, setName] = useState<string>(booking.customerName);
  const [number, setNumber] = useState<string>(booking.customerContact);
  const [dailyRentalPrice, setDailyRentalPrice] = useState<number>(
    booking.dailyRentalPrice,
  );
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod);
  const [advancePayment, setAdvancePayment] = useState(booking.advancePayment);
  const [totalAmount, setTotalAmount] = useState(booking.totalPrice);
  const [documents, setDocuments] = useState<Document[] | undefined>(
    booking.documents,
  );
  const [carImages, setCarImages] = useState<CarImage[] | undefined>(
    booking.carImages,
  );
  const [odometerReading, setOdometerReading] = useState<string | undefined>(
    booking.odometerReading,
  );
  const [notes, setNotes] = useState<string | undefined>(booking.notes);
  const [selfieUrl, setSelfieUrl] = useState(booking.selfieUrl);
  const [address, setAddress] = useState(booking.customerAddress);
  const [securityDeposit, setSecurityDeposit] = useState(
    booking.securityDeposit,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropDownOpen, setIsDropdownOpen] = useState(false);
  const [isBookingStopOpen, setIsBookingStopOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>(
    {
      documents: [],
      photos: [],
      selfie: [],
    },
  );
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Please wait");
  const {events,setEvents} = useEventStore();
  const [openMailDialog, setOpenMailDialog] = useState(false);

  const initialReading = useMemo(() => {
    if (booking.endodometerReading) return booking.endodometerReading;
    if (!odometerReading) return "";
    let reading = Math.floor(Number(odometerReading) / 1000);
    const thirdLastDigit = parseInt(
      odometerReading[odometerReading.length - 3],
    );
    if (thirdLastDigit === 9) {
      reading = reading + 1;
    }
    return reading.toString();
  }, [odometerReading, booking.endodometerReading]);
  const [endOdometerReading, setEndOdometerReading] = useState(initialReading);

  useEffect(() => {
    const cost = calculateCost(
      startDate,
      endDate,
      startTime,
      endTime,
      dailyRentalPrice,
    );
    setTotalAmount(cost);
  }, [dailyRentalPrice, startDate, endDate, startTime, endTime]);

  function handleAction() {
    //add code to stop or start the booking
    if (action === "Start") {
      router.push(`/booking/start/form/${booking.id}`);
    } else if (action === "Delete") {
      handleDelete();
    } else if (action === "Update") {
      handleUpdate();
    } else if (action === "delete the documents of") {
      handleDocumentDelete();
    } else if (action === "delete the car photos of") {
      handleCarImageDelete();
    }else if( action === "Cancel"){
      handleCancel();
    }
    return;
  }

  function handleReset() {
    //add code to stop or start the booking
    setIsEditable(!isEditable);
    setStartDate(new Date(booking.start));
    setEndDate(new Date(booking.end));
    setBookingStatus(booking.status);
    setName(booking.customerName);
    setNumber(booking.customerContact);
    setSecurityDeposit(booking.securityDeposit);
    setOdometerReading(booking.odometerReading);
    setNotes(booking.notes);
    setAddress(booking.customerAddress);
    setErrors({});
    setUploadedFiles({
      documents: [],
      photos: [],
      selfie: [],
    });
    return;
  }

  const handleCancel = async () => {
    try {
      await axios.put(`${BASE_URL}/api/v1/booking/${booking.id}/cancel`,
        { },
        {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      setBookingStatus("Cancelled");
      toast({
        description: `Booking Successfully cancelled`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        duration: 2000,
      });
    }
    catch (error) {
      console.error(error);
      toast({
        description: `Booking failed to cancel`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/api/v1/booking/${booking.id}`, {
        headers: {
          "Content-type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast({
        description: `Booking Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        duration: 2000,
      });

      setEvents(events.filter((event) => event.id != booking.id));
      router.push("/bookings");
    } catch (error) {
      console.error(error);
      toast({
        description: `Booking failed to delete`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
    }
    setIsDeleting(false);
  };

  const handleDocumentDelete = async () => {
    try {
      if (!documents) return;
      await axios.delete(
        `${BASE_URL}/api/v1/customer/${booking.customerId}/documents/all`,
        {
          headers: {
            authorization: `Bearer ` + localStorage.getItem("token"),
          },
        },
      );
      setDocuments([]);
      toast({
        description: `Document Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        duration: 2000,
      });
    } catch (error) {
      toast({
        description: `Failed to delete document`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      console.log(error);
    }
  };

  const handleCarImageDelete = async () => {
    try {
      if (!carImages) return;
      await axios.delete(
        `${BASE_URL}/api/v1/booking/${booking.id}/car-images/all`,
        {
          headers: {
            authorization: `Bearer ` + localStorage.getItem("token"),
          },
        },
      );
      setCarImages([]);
      toast({
        description: `Car image Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        duration: 2000,
      });
    } catch (error) {
      toast({
        description: `Failed to delete car photos`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      console.log(error);
    }
  };

  const handleUpdate = async () => {
    // Implement edit functionality here
    setIsLoading(true);
    try {
      let overallProgress = 0;

      setProgress(overallProgress);
      const totalSize = Object.values(uploadedFiles)
        .flat()
        .reduce((acc, file) => acc + file.size, 0);

      const docFiles = [];
      if (uploadedFiles.documents) {
        for (const file of uploadedFiles.documents) {
          const res = await uploadToDrive(file, booking.folderId);
          if (res.error) {
            throw new Error("Failed to upload documents");
            return;
          }
          docFiles.push(res);
          overallProgress += Math.round((file.size / totalSize) * 100) * 0.97;
          setProgress(overallProgress);
        }
      }
      setLoadingMessage("Uploaded Aadhar");

      const photoFiles = [];
      if (uploadedFiles.photos) {
        setLoadingMessage("Uploading Car Photos");
        for (const file of uploadedFiles.photos) {
          const res = await uploadToDrive(file, booking.bookingFolderId);
          if (res.error) {
            throw new Error("Failed to upload car photos");
            return;
          }
          photoFiles.push(res);
          overallProgress += Math.round((file.size / totalSize) * 100) * 0.97;
          setProgress(overallProgress);
        }
      }

      let resSelfie;
      if (uploadedFiles.selfie[0]) {
        resSelfie = await uploadToDrive(
          uploadedFiles.selfie[0],
          booking.bookingFolderId,
        );
        setLoadingMessage("Uploaded Selfie");
        const selfieSize = uploadedFiles.selfie[0].size;
        overallProgress += Math.round((selfieSize / totalSize) * 100) * 0.97;
        setProgress(overallProgress);
      }
      if (resSelfie && resSelfie.error) {
        toast({
          description: `Failed to upload selfie photo`,
          className:
            "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
          variant: "destructive",
          duration: 2000,
        });
        throw new Error("Failed to upload selfie photo");
      }

      const res = await axios.put(
        `${BASE_URL}/api/v1/booking/${booking.id}`,
        {
          startDate,
          endDate,
          startTime,
          endTime,
          carId: booking.carId,
          status: bookingStatus,
          customerName: name,
          customerAddress: address,
          customerContact: number,
          securityDeposit,
          dailyRentalPrice,
          paymentMethod,
          advancePayment,
          totalAmount,
          odometerReading,
          endOdometerReading,
          notes,
          documents: docFiles.length > 0 ? docFiles : undefined,
          selfieUrl: resSelfie && resSelfie.url,
          carImages: photoFiles.length > 0 ? photoFiles : undefined,
        },
        {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setProgress(100);
      setDocuments(res.data.documents);
      setCarImages(res.data.carImages);
      setSelfieUrl(res.data.selfieUrl);
      setErrors({});
      setUploadedFiles({
        documents: [],
        photos: [],
        selfie: [],
      });
      setIsEditable(false);
      toast({
        description: `Booking Successfully updated`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        duration: 2000,
      });
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
    setIsLoading(false);
  };

  const handleRemoveFile = (type: string, index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const files = event.target.files;
    if (files) {
      let length = uploadedFiles[type].length + files.length;
      if (type === "selfie") {
        if (length > 1) {
          setErrors((prev) => ({
            ...prev,
            [type]: "Please upload only one image",
          }));
          return;
        }
      } else if (type === "documents") {
        length = documents ? documents.length + length : length;
        if (length > 5) {
          setErrors((prev) => ({
            ...prev,
            [type]: "You can upload upto 5 documents or images",
          }));
          return;
        }
      } else {
        if (length > 5) {
          setErrors((prev) => ({
            ...prev,
            [type]: "You can upload upto 5 documents or images",
          }));
          return;
        }
      }
      for (const file of files) {
        if (file.size > 1024 * 1024 * 6) {
          setErrors((prev) => ({
            ...prev,
            [type]: "File size should be less than 6MB",
          }));
          return;
        }
        if (type === "documents") {
          if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
            setErrors((prev) => ({
              ...prev,
              [type]: "Please upload only image or pdf files",
            }));
            return;
          }
        } else {
          if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({
              ...prev,
              [type]: "Please upload only image",
            }));
            return;
          }
        }
      }
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...Array.from(files)],
      }));
      setErrors((prev) => ({ ...prev, [type]: "" }));
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
    else if (status === "Cancelled") {
      if(booking.cancelledBy === "guest"){
        headerText = "Booking was cancelled by customer";
      }
      else if(booking.cancelledBy === "host"){
        headerText = "Booking was cancelled by you";
      }
    }

    return headerText;
  }


  const getDocumentList = (type: "documents" | "photos" | "selfie") => {
    let documentList: {
      id: number;
      name: string;
      url: string;
      type: string;
    }[] = [];

    if (type === "documents") {
      documentList = documents ? documents : [];
    } else if (type === "photos") {
      documentList = carImages
        ? carImages.map((image) => {
            return {
              id: image.id,
              name: image.name,
              url: image.url,
              type: "image/jpeg",
            };
          })
        : [];
    } else {
      documentList = selfieUrl
        ? [
            {
              id: 1,
              name: "Car Selfie",
              url: selfieUrl,
              type: "image/jpeg",
            },
          ]
        : [];
    }

    return documentList;
  };

  const onDelete = (id: number, type: "documents" | "photos" | "selfie") => {
    if (type === "documents") {
      if (!documents) return;
      setDocuments(documents.filter((document) => document.id !== id));
    } else if (type === "photos") {
      setCarImages(carImages?.filter((document) => document.id !== id));
    } else if (type === "selfie") {
      setSelfieUrl("");
    }
  };

  const renderFileList = (type: "documents" | "photos" | "selfie") => {
    return (
      <div className="mt-2 text-sm">
        <RenderFileList
          editable={isEditable}
          documents={getDocumentList(type)}
          onDelete={onDelete}
          type={type}
          bookingId={booking.id}
        />
        <RenderNewFileList
          uploadedFiles={uploadedFiles[type]}
          handleRemoveFile={handleRemoveFile}
          type={type}
        />
      </div>
    );
  };

 

  return (
    <div>
      {isDeleting && (
        <div className=" bg-black bg-opacity-80 fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center">
          <div className="flex space-x-2 justify-center items-center w-screen h-screen">
            <Loader/>
          </div>
        </div>
      )}
      <MailDialog mail={booking.customerMail} open={openMailDialog} setOpen={setOpenMailDialog} booking={booking}/>
      <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-300 dark:border-muted dark:text-white">
        <div
          className="mr-2 rounded-md font-bold  cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-200"
          onClick={() => router.push("/bookings")}
        >
          <div className="h-10 w-9 flex border-border border justify-center items-center rounded-md ">
            <BackArrow className="h-7 w-7 stroke-0 fill-gray-800 dark:fill-blue-300" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Booking {bookingStatus}</h2>
          <p className="text-sm text-blue-500">Booking ID: {booking.id}</p>
        </div>
        <div className="mr-1 sm:mr-4 ">
          {isAdmin &&
          <DropdownMenu
            open={isDropDownOpen}
            onOpenChange={setIsDropdownOpen}
            modal={false}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 active:scale-95">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleReset}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setAction("Delete");
                  setIsDialogOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
              >
                <ExportIcon className="mr-2 h-4 w-4 stroke-1 stroke-black dark:stroke-white dark:fill-white" />
                <ExportButton booking={booking}/> 
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setAction("Cancel");
                  setIsDialogOpen(true);
                  setIsDropdownOpen(false);
                }}
              >
                <Cancel className="mr-2 h-4 w-4 stroke-1 stroke-black dark:stroke-white dark:fill-white" />
                <span>Cancel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenMailDialog(true)}
              >
                <Share className="mr-2 h-4 w-4 " />
                <span>Share</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          }
        </div>
        {/* Spacer for alignment */}
      </div>

      <div className="px-1 sm:px-4 py-4 border-b-4 border-gray-200 dark:border-muted ">
        <div className="flex justify-between items-center relative">
          <div>
            {booking.otp && booking.otp !== "" &&
              <div className="absolute top-1 left-1 flex gap-2 text-gray-500 items-center w-fit ">
              <p className="font-semibold max-sm:text-sm">
                OTP:
              </p>
              <p className="font-semibold max-sm:text-sm">
                {booking.otp}
              </p>
            </div>}
            <p className="text-sm text-blue-500">
              {getHeader(
                bookingStatus,
                startDate.toDateString(),
                startTime,
                endDate.toDateString(),
                endTime,
              )}
            </p>
            <p className="font-semibold max-sm:text-sm">
              {formatDateTime(
                bookingStatus === "Upcoming" ? startDate : endDate,
              )}
            </p>
          </div>
          <div className="text-right flex flex-col items-end w-fit">
            <div className="relative flex items-center sm:h-24 sm:w-36 rounded-md border border-border h-20 w-32 mb-2">
              {booking.carImageUrl !== "" ? (
                <Image
                  src={booking.carImageUrl}
                  alt={booking.carName}
                  fill
                  sizes="6"
                  priority={true}
                  className="object-cover rounded w-full"
                />
              ) : (
                <CarIcon className="w-full dark:stroke-blue-200 p-1  dark:fill-blue-200 stroke-black fill-black" />
              )}
            </div>
            <p className="text-sm font-semibold text-[#4B4237] max-sm:max-w-[180px] dark:text-gray-400">
              {booking.carName}
            </p>
            <p className="text-xs text-blue-500">{booking.carPlateNumber}</p>
          </div>
        </div>
      </div>

      <div className="px-1 sm:px-4 py-4 border-b-4 border-gray-200 dark:border-muted">
        <h3 className="text-lg font-semibold mb-4 ">Booking Details</h3>
        <div className="flex items-center justify-center gap-8 max-sm:gap-2 mb-4">
          <div className="w-full flex flex-col items-end">
          <div className="w-fit">
            <p className="text-sm text-blue-500">From</p>
            {!isEditable || !isAdmin ? (
              <p className="font-semibold max-sm:text-sm">
                {formatDateTime(startDate)} {booking.startTime.slice(0,5)}
              </p>
            ) : (
              <div className="flex space-x-2">
                <div className="">
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className=" mx-2">
                  <AddTime
                    className=""
                    selectedTime={startTime}
                    setSelectedTime={setStartTime}
                  />
                  <input type="hidden" name="time" value={startTime} />
                </div>
              </div>
            )}
          </div>
          </div>
          <div className="w-full flex justify-center">
            <ArrowRight className="mt-4 w-12 stroke-0 fill-blue-400 flex-shrink-0" />
          </div>
          <div className="w-full">
            <p className="text-sm text-blue-500">To</p>
            {!isEditable || !isAdmin ? (
              <p className="font-semibold max-sm:text-sm">
                {formatDateTime(endDate)} {booking.endTime.slice(0,5)}
              </p>
            ) : (
              <div className="flex space-x-2">
                <div className="">
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
                <div className=" mx-2">
                  <AddTime
                    className=""
                    selectedTime={endTime}
                    setSelectedTime={setEndTime}
                  />
                  <input type="hidden" name="time" value={endTime} />
                </div>
              </div>
            )}
          </div>
        </div>
        <hr className="my-4 border-gray-200 dark:border-muted" />
        <div className="grid grid-cols-2 items-center sm:gap-6">
          <div>
            <p className="text-sm text-blue-500 mb-1">Booked by</p>
            {!isEditable || !isAdmin ? (
              <>
                <p className="font-semibold">{name}</p>
                <p className="text-sm">{number}</p>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-[130px] sm:w-[170px]  sm:text-sm text-xs border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                />
                <Input
                  type="text"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-[130px] sm:w-[170px]  sm:text-sm text-xs border-0 p-0 px-1 my-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  "
                />
              </>
            )}
          </div>
          <div>
            {booking.customerAddress && (
              <div>
                <p className="text-sm text-blue-500">Address</p>
                {!isEditable || !isAdmin ? (
                  <span className="text-sm whitespace-wrap max-w-[120px]">
                    {address}
                  </span>
                ) : (
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-[170px] sm:w-[320px] text-xs sm:text-sm h-fit border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <hr className="my-4 border-gray-200 dark:border-muted" />
        <div>
          <p className="text-sm text-blue-500 mb-1">Booking Status</p>
          <div>
            {isEditable && isAdmin ? (
              <StatusInput
                status={bookingStatus}
                setStatus={setBookingStatus}
                className="bg-gray-200 dark:bg-muted"
              />
            ) : (
              <p className={` `}>{bookingStatus}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-1 sm:px-4 py-4 border-b-4 border-gray-200 dark:border-muted">
        <h3 className="text-lg font-semibold mb-4 ">
          Price and Payment Details
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-sm text-blue-500 mb-1">24 Hr Price</p>
            {!isEditable || !isAdmin ? (
              <p className="text-sm">{dailyRentalPrice}</p>
            ) : (
              <>
                <Input
                  type="text"
                  id="number"
                  value={dailyRentalPrice}
                  onChange={(e) => setDailyRentalPrice(Number(e.target.value))}
                  className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 my-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  "
                />
              </>
            )}
          </div>
          {booking.securityDeposit && (
            <div>
              <p className="text-sm text-blue-500">Security Deposit</p>
              {!isEditable || !isAdmin ? (
                <span className="text-sm">{securityDeposit}</span>
              ) : (
                <>
                  <Input
                    type="text"
                    id="name"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                  />
                </>
              )}
            </div>
          )}
        </div>
        <hr className="my-4 border-gray-200 dark:border-muted" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-500">Payment Amount</p>
              <span className="text-sm">{totalAmount}</span>
            </div>
            {booking.paymentMethod && (
              <div>
                <p className="text-sm text-blue-500">Payment Method</p>
                {!isEditable || !isAdmin ? (
                  <>
                    <span className="text-sm">{paymentMethod}</span>
                  </>
                ) : (
                  <>
                    <Input
                      type="text"
                      id="name"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                    />
                  </>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-blue-500">Payment Remaining</p>
            <span className="text-sm">
              {(totalAmount ? totalAmount : 0) -
                (advancePayment ? advancePayment : 0)}
            </span>
              <div>
                <p className="text-sm text-blue-500">Payment Done</p>
                {!isEditable || !isAdmin ? (
                  <>
                    {advancePayment ?
                    <span className="text-sm">{advancePayment}</span>
                    :
                    <span className="text-sm">NA</span>
                    }
                  </>
                ) : (
                  <>
                    <Input
                      type="text"
                      id="number"
                      value={advancePayment}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setAdvancePayment(Number(e.target.value))
                        }
                      }}
                      className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 my-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        "
                    />
                  </>
                )}
              </div>
          </div>
        </div>
      </div>
      <div className="px-1 sm:px-4 py-4 border-b-4 border-gray-200 dark:border-muted">
        <h3 className="text-lg font-semibold mb-4 ">Some more details</h3>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            {booking.odometerReading && (
              <div>
                <p className="text-sm text-blue-500">Odometer Reading</p>
                {!isEditable || !isAdmin ? (
                  <span className="text-sm">{odometerReading}</span>
                ) : (
                  <>
                    <Input
                      type="text"
                      id="name"
                      value={odometerReading}
                      onChange={(e) => setOdometerReading(e.target.value)}
                      className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                    />
                  </>
                )}
              </div>
            )}
            {booking.status !== "Upcoming" && (
              <div>
                <p className="text-xs sm:text-sm text-blue-500">
                  Selfie with car
                </p>
                <div>{renderFileList("selfie")}</div>
                {(!selfieUrl || uploadedFiles["selfie"].length === 0) && (
                  <div className="h-[20px] w-full" />
                )}
                {isEditable && isAdmin && !selfieUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("selfie")?.click()}
                      className="bg-transparent active:scale-95 flex items-center justify-center text-xs sm:text-sm w-[130px] sm:w-[200px]"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "selfie")}
                      className="hidden"
                    />
                  </>
                )}
                {errors.selfie && (
                  <p className="text-red-500 text-sm mt-1">{errors.selfie}</p>
                )}
              </div>
            )}

            <div>
              <div className="flex sm:gap-1 items-center">
                <p className="text-xs sm:text-sm text-blue-500">
                  Aadhar Card and Driving License
                </p>
                {isEditable && isAdmin && documents && (
                  <Button
                    className="cursor-pointer active:scale-95 p-2 bg-gray-200 dark:bg-muted dark:text-white text-black hover:bg-gray-300 dark:hover:bg-secondary hover:bg-opacity-30"
                    onClick={() => {
                      setAction("delete the documents of");
                      setIsDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {documents && (
                <div>
                  <div className="mt-2 text-sm">
                    {renderFileList("documents")}
                  </div>
                </div>
              )}
              {isEditable && isAdmin && (!documents || documents.length < 5) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("documents")?.click()
                    }
                    className="bg-transparent active:scale-95 flex items-center justify-center text-xs sm:text-sm w-[130px] sm:w-[200px]"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                  <Input
                    id="documents"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, "documents")}
                    className="hidden"
                  />
                </>
              )}
              {errors.documents && (
                <p className="text-red-500 text-sm mt-1">{errors.documents}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {booking.endodometerReading && (
              <div>
                <p className="text-sm text-blue-500">End Odometer Reading</p>
                {!isEditable || !isAdmin ? (
                  <span className="text-sm">{endOdometerReading}</span>
                ) : (
                  <>
                    <Input
                      type="text"
                      id="name"
                      value={endOdometerReading}
                      onChange={(e) => setEndOdometerReading(e.target.value)}
                      className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                    />
                  </>
                )}
              </div>
            )}
            {booking.odometerReading &&
              Number(endOdometerReading) > Number(odometerReading) && (
                <div>
                  <p className="text-sm text-blue-500">Kilometer travelled</p>
                  <span className="text-sm">
                    {Number(endOdometerReading) - Number(odometerReading)}
                  </span>
                </div>
              )}
            {booking.notes && (
              <div>
                <p className="text-sm text-blue-500">Notes if any</p>
                {!isEditable || !isAdmin ? (
                  <span className="text-sm">{notes}</span>
                ) : (
                  <>
                    <Input
                      type="text"
                      id="name"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-[130px] sm:w-[170px]  sm:text-sm text-xs  border-0 p-0 px-1 bg-gray-200 dark:bg-muted dark:hover:bg-card rounded-sm hover:bg-gray-300 focus-visible:ring-0 border-transparent border-y-4 focus:border-b-blue-400 "
                    />
                  </>
                )}
              </div>
            )}
            {booking.status !== "Upcoming" && (
              <div>
                <div className="flex sm:gap-1 items-center">
                  <p className="text-xs sm:text-sm text-blue-500">
                    Photos Before pick-up
                  </p>
                  {isEditable && isAdmin && carImages && (
                    <Button
                      className="cursor-pointer active:scale-95 p-2 bg-gray-200 dark:bg-muted dark:text-white text-black hover:bg-gray-300 dark:hover:bg-secondary hover:bg-opacity-30"
                      onClick={() => {
                        setAction("delete the car photos of");
                        setIsDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {carImages && carImages.length > 0 && (
                  <div>
                    <div className="mt-2 text-sm">
                      {renderFileList("photos")}
                    </div>
                  </div>
                )}
                {isEditable && isAdmin && (!carImages || carImages.length < 5) && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("photos")?.click()}
                      className="bg-transparent active:scale-95 flex items-center justify-center text-xs sm:text-sm w-[130px] sm:w-[200px]"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    <Input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, "photos")}
                      className="hidden"
                    />
                  </>
                )}
                {errors.photos && (
                  <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isAdmin &&
      <>
      {!isEditable && isAdmin && (
        <div className=" flex justify-center space-x-2 mt-2">
          {bookingStatus === "Upcoming" && (
            <Button
              className="px-4 py-4 max-sm:w-full active:scale-95 bg-blue-600 dark:text-black text-blue-100  shadow-lg"
              onClick={() => {
                router.push(`/booking/start/form/${booking.id}`);
              }}
            >
              <span className="">Start Booking</span>
            </Button>
          )}
          {bookingStatus === "Ongoing" && (
            <Button
              className="px-4 py-4 max-sm:w-full active:scale-95 bg-blue-600 dark:text-black text-blue-100  shadow-lg"
              onClick={() => {
                setAction("Stop");
                setIsBookingStopOpen(true);
              }}
            >
              <span className="">End Booking</span>
            </Button>
          )}
        </div>
      )}
      </>
      }
      {isEditable && isAdmin && (
        <div className=" flex justify-center space-x-2 mt-2">
          <>
            {!isLoading ? (
              <>
                <Button
                  className="px-4 py-4 max-sm:w-full active:scale-95 min-w-[100px] bg-primary hover:bg-opacity-50 shadow-lg"
                  onClick={() => {
                    setAction("Update");
                    setIsDialogOpen(true);
                  }}
                >
                  <span className="">Update</span>
                </Button>
                <Button
                  className="px-4 py-4 max-sm:w-full active:scale-95 min-w-[100px] bg-primary hover:bg-opacity-50 shadow-lg"
                  onClick={handleReset}
                >
                  <span className="">Reset</span>
                </Button>
              </>
            ) : (
              <div className="w-full max-w-[500px] border-2 border-border rounded-lg relative">
                <div
                  style={{ width: `${progress}%` }}
                  className={`bg-primary rounded-lg text-white h-[35px] transition-all duration-300 ease-in-out hover:bg-opacity-80 ${isLoading && "rounded-e-none"}`}
                />
                <div
                  className={`w-full h-[35px] p-1 flex justify-center items-center absolute top-0 left-0 `}
                >
                  <span className="text-black dark:text-white max-sm:text-xs">
                    {loadingMessage}
                  </span>
                  <div className="flex items-end px-1 pb-2 h-full">
                    <span className="sr-only">Loading...</span>
                    <div className="h-1 w-1 bg-black dark:bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-1 w-1 bg-black dark:bg-white mx-[2px] border-border rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-1 w-1 bg-black dark:bg-white mx-[2px] border-border rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      )}
      <ActionDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        action={action}
        handleAction={handleAction}
      />
      <BookingStop
        setEndOdometerReading={setEndOdometerReading}
        endOdometerReading={endOdometerReading}
        bookingId={booking.id}
        endDate={endDate}
        setEndDate={setEndDate}
        endTime={endTime}
        setEndTime={setEndTime}
        setBookingStatus={setBookingStatus}
        isOpen={isBookingStopOpen}
        setIsOpen={setIsBookingStopOpen}
        odometerReading={odometerReading}
      />
    </div>
  );
}
