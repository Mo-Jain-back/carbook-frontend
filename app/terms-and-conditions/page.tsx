"use client";

import BackArrow from "@/public/back-arrow.svg";
import { useRouter } from "next/navigation";

export default function TermsAndConditions() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-200 dark:bg-[#181818] text-primary-foreground py-8">
      <div
          className="mr-2 rounded-md font-bold w-fit  cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-200"
          onClick={() => router.back()}
        >
          <div className="h-10 w-9 flex border-border border justify-center items-center rounded-md ">
            <BackArrow className="h-7 w-7 stroke-0 fill-gray-800 dark:fill-blue-300" />
          </div>
        </div>
        <div className="container mx-auto px-4 whitespace-nowrap">
          <div className="flex flex-col items-center justify-center text-center text-black dark:text-white">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">
              Terms and Conditions
            </h1>
            <p className="text-md sm:text-lg">Jain Car Rentals</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 bg-background">
        <div className="max-w-4xl mx-auto bg-muted rounded-lg shadow-sm border border-border p-4 sm:p-8">
          <div className="prose max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  1. Rental Term, Rate & Payment Mode
                </h2>
                <p className="text-sm sm:text-md">
                  The rental period begins on the date and time specified in the booking.
                  The Vehicle is reserved for these precise dates and 
                  times, and any extension is contingent upon availability.
                  Rental charges will be calculated on an hourly or daily basis,
                  according to the agreed-upon rate.A daily limit of 300 KM applies unless `&ldquo;`unlimited KM`&ldquo;` is explicitly stated..
                </p>
                <p className="text-sm sm:text-md">
                  The rental policy states that no refunds will be given for vehicles returned early (before the scheduled end time).
                  If a vehicle is returned late, the customer will be charged according to the applicable hourly and daily extension rates. To rent a vehicle, customers must present the original hard copies of their Aadhaar card and a valid driving license to Jain Car Rental. Jain Car Rental will retain one original ID card for the duration of the booking.
                  We assure the renter that their ID card will be kept safe and will not be used for any other activities.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  2. Ownership & Use of vehicle
                </h2>
                <p className="text-sm sm:text-md">
                  The Lessee acknowledges that the Vehicle is the sole property
                  of the Lessor. The Lessee has no ownership rights.
                </p>
                <p className="text-sm sm:text-md">
                  The vehicle rental agreement grants the Lessee (renter) a temporary right to use the vehicle,
                  which remains the exclusive property of the Lessor (owner).
                  Use is strictly limited to personal, non-commercial purposes.
                  Prohibited uses include all commercial activities, such as ride-sharing (Uber, Lyft), delivery services, sub-leasing, and for-hire transportation (taxi).
                  Violation of these terms is a material default, leading to potential lease termination, vehicle repossession, and liability for damages.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  3. Prohibited Actions
                </h2>
                <p className="text-sm sm:text-md">
                  The Vehicle is the exclusive property of Jain Car Rental. The Lessee is strictly forbidden from selling, mortgaging, sub-leasing, renting, or otherwise encumbering the Vehicle to anyone not listed in the booking details without the express consent of Jain Car Rental.
                  Any violation of these terms constitutes a breach of this Agreement, which may result in legal action.
                  In the event of a breach of the terms, Jain Car Rental reserves the right to retrieve the vehicle from any location and return it to its office without prior notice to the person who rented the car.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  4. Maintenance and Care
                </h2>
                <p className="text-sm sm:text-md">
                  The Lessee is required to maintain the rented Vehicle in good condition, operate it lawfully, and return it to the Lessor at the end of the Rental Term in the same condition as received,
                  allowing for normal wear and tear.The Lessee is held fully financially responsible for any damage to the Vehicle, including collision, theft, or vandalism, that occurs during the Rental Term, regardless of fault.
                  This responsibility covers the full cost of repairs, replacement, towing, storage, and the Lessor's loss of rental income.
                  If the Vehicle is a total loss, the Lessee is liable for its fair market value
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  5. Indemnification & Governing Law
                </h2>
                <p className="text-sm sm:text-md">
                  The Lessee agrees to indemnify and hold harmless the Lessor
                  from any and all claims, damages, losses, or expenses arising
                  out of the Lessee&apos;s use of the Vehicle. This Agreement
                  shall be governed by and construed in accordance with the laws
                  of the state of Ahmedabad, Gujarat.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  6. Traffic Violation Challan
                </h2>
                <p className="text-sm sm:text-md">
                  You are responsible for paying any traffic violation fines incurred during your rental period.
                  If you fail to respond to or deny a notice to pay a challan, legal proceedings may be initiated. In such an event,
                  Jain Car Rental reserves the right to visit your registered address to recover the outstanding fine, along with any associated legal expenses.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  7.  Security Deposit
                </h2>
                <p className="text-sm sm:text-md">
                  Acceptable in terms of cash (5000-10000) and kind (two wheeler) Refundable after return of Car after Inspection. 
                  - Deductions apply for Damage , Fines, Late Return, Traffic Challan, Cleaning charges and Fuel incompleteness.
                </p>
              </section>

              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  8. Vehicle Return Policy
                </h2>
                <p className="text-sm sm:text-md">
                  Return Timing and Late Fees:Vehicles must be returned by the agreed-upon time.
                                Advance notification is mandatory for any expected delay. Unnotified late returns are strictly prohibited.
                                Late returns will incur hourly charges calculated based on the standard daily rate.
                                A delay exceeding 4 hours will extend the rental by 12 hours.
                                A delay over 16 hours will result in a charge for an entire additional rental day.
                  Operating Hours: Vehicle pickup and return are permitted only between 9:00 AM and 11:00 PM.
                  Fuel Policy:  The rental price does not include fuel, unless explicitly stated otherwise.
                                Vehicles must be returned with the same fuel level as at the time of pickup.
                                Any extra fuel beyond the starting level is non-refundable.
                  Cleaning Fee:A cleaning fee of up to Rs 500/- may be applied if the vehicle is not returned in a clean condition.
                  Premium Car Rental Eligibility: The minimum age requirement for renting Premium Cars is 21 years old.
                </p>
              </section>
              <section>
                <h2 className="text-md sm:text-lg font-bold mb-3">
                  9. Entire Agreement
                </h2>
                <p className="text-sm sm:text-md">
                  This Agreement constitutes the entire understanding between
                  the parties and supersedes all prior discussions, agreements,
                  or understandings, whether written or oral. The Lessor hereby
                  agrees to rent to the Lessee the following vehicle.
                </p>
              </section>
              
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Jain Car Rentals. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
