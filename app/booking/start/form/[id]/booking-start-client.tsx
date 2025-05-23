"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { useCarStore } from "@/lib/store";
import { DatePicker } from "@/components/ui/datepicker";
import AddTime from "@/components/add-time";
import { calculateCost } from "@/components/add-booking";
import { Booking, Document } from "./page";
import { RenderFileList, RenderNewFileList } from "./render-file-list";
import { uploadToDrive } from "@/app/actions/upload";
import Link from "next/link";
import MailDialog from "@/components/mail-dialog";
import BackArrow from "@/public/back-arrow.svg";

interface FormErrors {
  [key: string]: string;
}

export default function BookingStartClient({
  booking,
  setBooking,
  bookingId,
}: {
  booking: Booking;
  setBooking: React.Dispatch<React.SetStateAction<Booking | undefined>>;
  bookingId: string | string[];
}) {
  const [customerName, setCustomerName] = useState(booking.customerName);
  const [phoneNumber, setPhoneNumber] = useState(booking.customerContact);
  const [selectedCar, setSelectedCar] = useState(booking.carId);
  const [startDate, setStartDate] = useState(new Date(booking.start));
  const [startTime, setStartTime] = useState(booking.startTime);
  const [returnDate, setReturnDate] = useState(new Date(booking.end));
  const [returnTime, setReturnTime] = useState(booking.endTime);
  const [securityDeposit, setSecurityDeposit] = useState(
    booking.securityDeposit || "",
  );
  const [odometerReading, setOdometerReading] = useState(
    Number(booking.currOdometerReading) || 0,
  );
  const [address, setAddress] = useState(booking.customerAddress);
  const [notes, setNotes] = useState(booking.notes);
  const [bookingAmountReceived, setBookingAmountReceived] = useState(
    booking.advancePayment || 0,
  );
  const [dailyRentalPrice, setDailyRentalPrice] = useState(
    booking.dailyRentalPrice || 0,
  );
  const [totalAmount, setTotalAmount] = useState(booking.totalPrice || 0);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [documents, setDocuments] = useState<Document[] | undefined>(
    booking.documents,
  );
  const router = useRouter();
  const { cars } = useCarStore();
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
  const [customerMail, setCustomerMail] = useState(booking.customerMail || "");
  const [isMailDialogOpen, setIsMailDialogOpen] = useState(false);
  const [fastrack,setFastrack] = useState(Number(booking.fastrack) || 0);

  useEffect(() => {
    const cost = calculateCost(
      startDate,
      returnDate,
      startTime,
      returnTime,
      dailyRentalPrice,
    );
    setTotalAmount(cost);
  }, [dailyRentalPrice, startDate, returnDate, startTime, returnTime]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!customerName) newErrors.customerName = "This field is mandatory";
    if (!phoneNumber) newErrors.phoneNumber = "This field is mandatory";
    if (!selectedCar) newErrors.selectedCar = "This field is mandatory";
    if (!startDate) newErrors.startDate = "This field is mandatory";
    if (!startTime) newErrors.startTime = "This field is mandatory";
    if (!returnDate) newErrors.returnDate = "This field is mandatory";
    if (!returnTime) newErrors.returnTime = "This field is mandatory";
    if (!securityDeposit) newErrors.securityDeposit = "This field is mandatory";
    if (!odometerReading) newErrors.odometerReading = "This field is mandatory";
    if (!address) newErrors.address = "This field is mandatory";
    if (!customerMail) newErrors.mail = "This field is mandatory";
    if (!bookingAmountReceived)
      newErrors.bookingAmountReceived = "This field is mandatory";
    if (!dailyRentalPrice)
      newErrors.dailyRentalPrice = "This field is mandatory";
    if (!totalAmount) newErrors.totalAmount = "This field is mandatory";
    if (!paymentMethod) newErrors.paymentMethod = "This field is mandatory";
    if (!termsAccepted)
      newErrors.terms = "You must accept the terms and conditions";
    if(customerMail === "") newErrors.mail = "This field is mandatory";
    if(fastrack === 0) newErrors.fastrack = "This field is mandatory";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleRemoveFile = (type: string, index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleDeleteDocument = async (
    id: number,
    url: string,
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!documents) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/api/v1/customer/document/${id}`, {
        headers: {
          "Content-type": "application/json",
          authorization: `Bearer ` + localStorage.getItem("token"),
        },
      });
      setDocuments(documents.filter((document) => document.id !== id));
      toast({
        description: `Document Successfully deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
      });
    } catch (error) {
      console.log(error);
      toast({
        description: `Document could not be deleted`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
    }
    setIsDeleting(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast({
        description: `Please fill all mandatory fields`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setIsLoading(true);
    try {
      setProgress(100);
      setLoadingMessage("Starting booking");
      await axios.put(
        `${BASE_URL}/api/v1/booking/${bookingId}/start`,
        {
          customerName,
          customerContact: phoneNumber,
          selectedCar,
          startDate: startDate.toLocaleDateString("en-US"),
          startTime,
          returnDate: returnDate.toLocaleDateString("en-US"),
          returnTime,
          securityDeposit,
          odometerReading: odometerReading.toString(),
          fastrack:fastrack,
          customerAddress: address,
          bookingAmountReceived,
          dailyRentalPrice,
          totalAmount,
          paymentMethod,
          notes,
          customerMail:customerMail,
        },
        {
          headers: {
            "Content-type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const newBooking:Booking ={
        ...booking,
        customerName,
        customerContact: phoneNumber,
        carId:selectedCar,
        start: startDate.toLocaleDateString("en-US"),
        startTime,
        end: returnDate.toLocaleDateString("en-US"),
        endTime:returnTime,
        securityDeposit,
        odometerReading: odometerReading.toString(),
        fastrack,
        customerAddress: address,
        advancePayment:bookingAmountReceived,
        dailyRentalPrice,
        totalPrice:totalAmount,
        paymentMethod,
        notes,
        customerMail:customerMail,
      }

      setBooking(newBooking);

      const totalSize = Object.values(uploadedFiles)
          .flat()
          .reduce((acc, file) => acc + file.size, 0);

      toast({
        description: `Booking Successfully started`,
        duration: 2000,
      });
      
      if(totalSize> 0) {
        let overallProgress = 1;
        setProgress(overallProgress);
        setLoadingMessage("Uploading Aadhar ");

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
        if(uploadedFiles.photos.length > 0) {
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
        let resSelfie
        if(uploadedFiles.selfie.length > 0) {
          setLoadingMessage("Uploading Selfie");
          resSelfie = await uploadToDrive(
            uploadedFiles.selfie[0],
            booking.bookingFolderId,
          );
          const selfieSize = uploadedFiles.selfie[0].size;
          overallProgress += Math.round((selfieSize / totalSize) * 100) * 0.97;
          setProgress(overallProgress);
        }

        setLoadingMessage("Uploaded Selfie");
        
        if (resSelfie && resSelfie.error) {
          throw new Error("Failed to upload selfie photo");
          return;
        }
        setProgress(98);
        setLoadingMessage("Please wait");
   
        await axios.put(
          `${BASE_URL}/api/v1/booking/${bookingId}/start/document`,
          {
            documents: docFiles.length > 0 ? docFiles : undefined,
            selfieUrl: resSelfie ? resSelfie.url : undefined,
            carImages: photoFiles.length > 0 ? photoFiles : undefined,
          },
          {
            headers: {
              "Content-type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast({
          description: `Document Successfully uploaded`,
          duration: 2000,
        });
      }
      setIsLoading(false);
      setProgress(100);
      setIsMailDialogOpen(true)
    } catch (error) {
      console.log(error);
      toast({
        description: `Failed to submit form`,
        className:
          "text-black bg-white border-0 rounded-md shadow-mg shadow-black/5 font-normal",
        variant: "destructive",
        duration: 2000,
      });
      setIsLoading(false);
      setProgress(0);
    }
  };

  const renderFileList = (type: string) => {
    return (
      <div className="mt-2 text-sm">
        {type === "documents" && documents && documents.length > 0 && (
          <RenderFileList
            documents={documents}
            handleDeleteDocument={handleDeleteDocument}
          />
        )}
        <RenderNewFileList
          uploadedFiles={uploadedFiles[type]}
          handleRemoveFile={handleRemoveFile}
          type={type}
        />
      </div>
    );
  };

  const inputClassName = (fieldName: string) =>
    cn(
      "w-full text-sm border-border focus-visible:border-blue-400 focus-visible:ring-blue-400 overflow-hidden",
      errors[fieldName] && "border-red-500 focus:border-red-500",
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <MailDialog 
        booking={booking} 
        mail={customerMail}
        open={isMailDialogOpen} 
        setOpen={setIsMailDialogOpen} 
        handleSkip={() => router.push("/bookings")}
        />
      <div className="fixed top-[82px] px-3 sm:top-14 pt-2 bg-background z-10 w-full left-0 flex items-center gap-2 mb-6">
        <div
          className="mr-2 rounded-md font-bold  cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-200"
          onClick={() => router.push("/booking/"+bookingId)}
        >
          <div className="h-10 w-9 flex border-border border justify-center items-center rounded-md ">
            <BackArrow className="h-7 w-7 stroke-0 fill-gray-800 dark:fill-blue-300" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold ">Booking Start Checklist</h1>
          <div className="">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Booking Id:{" "}
            </span>
            <span className="text-sm">{bookingId}</span>
          </div>
        </div>
      </div>
      <div className="h-[60px] w-full"/>
      <div className="space-y-6 max-sm:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between space-x-2 items-center">
              <div>
                <Label className="max-sm:text-xs" htmlFor="customerName">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setErrors((prev) => ({ ...prev, customerName: "" }));
                  }}
                  className={inputClassName("customerName")}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>
              <div>
                <Label className="max-sm:text-xs" htmlFor="phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }}
                  className={inputClassName("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2 justify-between items-center">
              <div>
                <Label className="max-sm:text-xs" htmlFor="startDate">
                  Start Date & Time <span className="text-red-500">*</span>
                </Label>
                <div className="flex space-x-2 justify-between items-center">
                  <div className="border border-border rounded-sm">
                    <DatePicker
                      className="w-full"
                      date={startDate}
                      setDate={setStartDate}
                    />
                  </div>
                  <div className="border border-border rounded-sm mx-2">
                    <AddTime
                      className="w-full h-9"
                      selectedTime={startTime}
                      setSelectedTime={setStartTime}
                    />
                    <input type="hidden" name="time" value={startTime} />
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <Label className="max-sm:text-xs" htmlFor="startDate">
                    Return Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-2 justify-between items-center">
                    <div className="border border-border rounded-sm">
                      <DatePicker
                        className="w-full"
                        date={returnDate}
                        setDate={setReturnDate}
                      />
                    </div>
                    <div className="border border-border rounded-sm mx-2">
                      <AddTime
                        className="w-full h-9"
                        selectedTime={returnTime}
                        setSelectedTime={setReturnTime}
                      />
                      <input type="hidden" name="time" value={returnTime} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between space-x-2 items-center">
              <div className="w-1/2">
                <Label className="max-sm:text-xs" htmlFor="selectedCar">
                  Selected Car <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCar.toString()}
                  onValueChange={(value) => {
                    setSelectedCar(Number(value));
                    setErrors((prev) => ({ ...prev, selectedCar: "" }));
                  }}
                >
                  <SelectTrigger
                    id="selectedCar"
                    value={selectedCar}
                    className={inputClassName("selectedCar")}
                  >
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-zinc-700">
                    {cars &&
                      cars.length > 0 &&
                      cars.map((car) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.brand + " " + car.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.selectedCar && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selectedCar}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <Label className="max-sm:text-xs" htmlFor="paymentMethod">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                  }}
                >
                  <SelectTrigger
                    id="paymentMethod"
                    value={paymentMethod}
                    className={inputClassName("paymentMethod")}
                  >
                    <SelectValue
                      className="placeholder:text-xs"
                      placeholder="Select method"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-muted border-border">
                    <SelectItem
                      className="hover:dark:bg-card cursor-pointer"
                      value="Cash"
                    >
                      Cash
                    </SelectItem>
                    <SelectItem
                      className="hover:dark:bg-card cursor-pointer"
                      value="Card"
                    >
                      Card
                    </SelectItem>
                    <SelectItem
                      className="hover:dark:bg-card cursor-pointer"
                      value="UPI"
                    >
                      UPI
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label className="max-sm:text-xs" htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, address: "" }));
                }}
                className={inputClassName("address")}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <Label className="max-sm:text-xs" htmlFor="mail">
                Customer Mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mail"
                value={customerMail}
                onChange={(e) => {
                  setCustomerMail(e.target.value);
                  setErrors((prev) => ({ ...prev, mail: "" }));
                }}
                className={inputClassName("mail")}
              />
              {errors.mail && (
                <p className="text-red-500 text-sm mt-1">{errors.mail}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between space-x-2 items-center">
              <div>
                <Label className="max-sm:text-xs" htmlFor="odometerReading">
                  Odometer Reading <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="odometerReading"
                  type="number"
                  value={odometerReading}
                  onChange={(e) => {
                    setOdometerReading(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, odometerReading: "" }));
                  }}
                  className={cn(
                    inputClassName("odometerReading"),
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  )}
                />
                {errors.odometerReading && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.odometerReading}
                  </p>
                )}
              </div>

              <div>
                <Label
                  className="max-sm:text-xs"
                  htmlFor="bookingAmountReceived"
                >
                  Amount Received <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bookingAmountReceived"
                  type="number"
                  value={bookingAmountReceived}
                  onChange={(e) => {
                    setBookingAmountReceived(Number(e.target.value));
                    setErrors((prev) => ({
                      ...prev,
                      bookingAmountReceived: "",
                    }));
                  }}
                  className={cn(
                    inputClassName("bookingAmountReceived"),
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  )}
                />
                {errors.bookingAmountReceived && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bookingAmountReceived}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-between space-x-2 items-center">
              <div>
                <Label className="max-sm:text-xs" htmlFor="dailyRentalPrice">
                  Daily Rental Charges <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dailyRentalPrice"
                  type="number"
                  value={dailyRentalPrice}
                  onChange={(e) => {
                    setDailyRentalPrice(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, dailyRentalPrice: "" }));
                  }}
                  className={cn(
                    inputClassName("dailyRentalPrice"),
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  )}
                />
                {errors.dailyRentalPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dailyRentalPrice}
                  </p>
                )}
              </div>
              <div>
                <Label className="max-sm:text-xs" htmlFor="totalAmount">
                  Total Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={totalAmount}
                  readOnly
                  className={cn(
                    inputClassName("totalAmount"),
                    "focus-visible:ring-0 focus:border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  )}
                />
                {errors.totalAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.totalAmount}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-between space-x-2 items-center">
              <div>
                <Label className="max-sm:text-xs" htmlFor="securityDeposit">
                  Security Deposit <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="securityDeposit"
                  value={securityDeposit}
                  onChange={(e) => {
                    setSecurityDeposit(e.target.value);
                    setErrors((prev) => ({ ...prev, securityDeposit: "" }));
                  }}
                  className={inputClassName("securityDeposit")}
                />
                {errors.securityDeposit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.securityDeposit}
                  </p>
                )}
              </div>
              <div>
                <Label className="max-sm:text-xs" htmlFor="securityDeposit">
                  FastTag Amount<span className="text-red-500"> *</span>
                </Label>
                <Input
                  type="text"
                  id="fastrack"
                  value={fastrack || 0}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                    setFastrack(Number(e.target.value));
                    }
                    setErrors((prev) => ({ ...prev, fastrack: "" }));
                  }}
                  className={inputClassName("fastrack")}
                />
                {errors.fastrack && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fastrack}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label className="max-sm:text-xs" htmlFor="notes">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
          <div>
            <Label className="max-sm:text-xs" htmlFor="documents">
              Driving License and Aadhar Card{" "}
              <span className="text-red-500">*</span>
            </Label>
            {uploadedFiles["documents"].length +
              (documents ? documents.length : 0) <=
              5 && (
              <Input
                id="documents"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, "documents")}
                className={cn(inputClassName("documents"), "max-sm:text-xs ")}
              />
            )}
            {errors.documents && (
              <p className="text-red-500 text-sm mt-1">{errors.documents}</p>
            )}
            {renderFileList("documents")}
          </div>
          <div>
            <Label className="max-sm:text-xs" htmlFor="photos">
              Photos before pick-up <span className="text-red-500">*</span>
            </Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, "photos")}
              className={cn(inputClassName("photos"), "max-sm:text-xs ")}
            />
            {errors.photos && (
              <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
            )}
            {renderFileList("photos")}
          </div>
          <div>
            <Label className="max-sm:text-xs" htmlFor="selfie">
              Upload the selfie with car <span className="text-red-500">*</span>
            </Label>
            <Input
              id="selfie"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "selfie")}
              className={cn(inputClassName("selfie"), "max-sm:text-xs ")}
            />
            {errors.selfie && (
              <p className="text-red-500 text-sm mt-1">{errors.selfie}</p>
            )}
            {renderFileList("selfie")}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={() => {
              setTermsAccepted(!termsAccepted);
              setErrors((prev) => ({ ...prev, terms: "" }));
            }}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium text-blue-400 underline cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <Link href="/terms-and-conditions">
              I agree to all the terms and conditions
            </Link>
            <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
        )}

        <div className="flex items-center justify-center space-x-2">
          {isLoading ? (
            <div className="w-full max-w-[500px] border-2 border-border rounded-lg relative overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className={`bg-primary rounded-lg text-white h-[35px] transition-all duration-300 ease-in-out hover:bg-opacity-80 ${(isLoading || progress === 100 )&& "rounded-e-none"}`}
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
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`bg-blue-600 active:scale-95 text-white hover:bg-opacity-80 w-full ${isLoading && "rounded-e-none cursor-not-allowed opacity-50"}`}
            >
              <span>Create</span>
            </Button>
          )}
          {!isLoading && (
            <Button
              onClick={() => router.push("/booking/" + bookingId)}
              className="bg-red-600 dark:bg-red-400 active:scale-95 text-card text-white hover:bg-red-500 w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
