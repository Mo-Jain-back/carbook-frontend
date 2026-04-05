import { calculateCost } from "@/lib/utils";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: { 
      padding: 30, 
      fontSize: 12,
    },
    innerBorder: {
      padding:20,
      border: "1pt solid black",
      height: "100%",
    },
    outerBorder: {
      padding:1,
      border: "3pt solid black",
      height: "100%",
    },
    pageContent: {
      padding:20,
      border: "1pt solid black",
      height: "100%",
    },
    section: { 
      marginBottom: 10 
    },
    header: { 
      textAlign: "center", 
      fontSize: 18, 
      fontWeight: "bold", 
      marginBottom: 5 
    },
    subHeader: { 
      textAlign: "left", 
      color: "#2563eb", 
      fontSize: 12,
      fontWeight: "bold",
      marginBottom:5
    },
    logotext: { 
        textAlign: "left", 
        fontSize: 8,
        fontWeight: "bold"
      },
    textHeading: { 
      fontWeight: "bold" ,
      marginBottom:5,
      fontSize:14
    },
    bold:{
        fontWeight: "bold"
    },
    row: {
      flexDirection: "row", 
      justifyContent: "space-between", 
      marginBottom: 5,
      alignItems: "center"
    },
    logo: {
        flexDirection: "row", 
        marginBottom: 5,
        marginRight:3,
        alignItems: "center",
      },
    imageContainer: { 
      width: 80, 
      height: 50, 
      borderWidth: 1, 
      borderColor: "#000" 
    },
    image: { 
      width: "25px", 
      height: "25px" 
    },
    text: { 
      marginBottom: 3 
    },
    link: {
      color: "#2563eb",
      textDecoration: "underline"
    },
    divider: { 
      borderBottomWidth: 1, 
      borderBottomColor: "#ddd", 
      marginVertical: 10 
    },
    column: {
      flex: 1
    },
    termsSection: {
      marginTop: 10,
      marginBottom: 10
    },
    termsHeader: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 8
    },
    termsParagraph: {
      fontSize: 10,
      marginBottom: 6,
      lineHeight: 1.4
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      textAlign: "center",
      fontSize: 10,
      color: "#666"
    },
    printRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    total: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #ddd",
      paddingTop:5,
      fontSize:12,
      fontWeight:"semibold",
    },
    money:{
      display:"flex",
      flexDirection:"row",
      gap:2,
      alignItems:"center"
    }
  });

 interface Booking {
  id: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerContact: string;
  carId: number;
  type:string;
  carName: string;
  carPlateNumber: string;
  dailyRentalPrice: number;
  securityDeposit?: string;
  totalPrice?: number;
  advancePayment?: number;
  customerAddress?: string;
  paymentMethod?: string;
  odometerReading?: string;
  notes?: string;
  fastrack?:number;
  endfastrack?:number;
}

const PDFDocument = ({ booking }: { booking: Booking }) => {
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalAmount = calculateCost(booking.start,booking.end,booking.startTime,booking.endTime,booking.dailyRentalPrice);
  const charge = booking?.totalPrice && (booking.paymentMethod === "card" || booking.paymentMethod === "netbanking") ? booking?.totalPrice*0.02 : 0;
  const amountRemaining = booking.totalPrice ? (booking.totalPrice - (booking.advancePayment || 0)) : 0;

  const getHeader = (
    status: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
  ) => {
    let headerText = "";
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    const currDate = new Date();

    if (status === "Upcoming") {
      headerText = startDateTime >= currDate ? "Pickup scheduled on" : "Pickup was scheduled on";
    } else if (status === "Ongoing") {
      headerText = endDateTime < currDate ? "Return was scheduled on" : "Return scheduled by";
    } else if (status === "Completed") {
      headerText = "Booking ended at";
    }

    return headerText;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
        <View style={styles.innerBorder}>
        <View style={styles.logo}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/favicon.png" style={styles.image} />
            <View style={{flexDirection:"column"}}>
                <Text style={styles.logotext}>Car</Text>
                <Text style={styles.logotext}>Rentals</Text>
            </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Car Rental Agreement</Text>
          <Text style={{...styles.subHeader,textAlign:"center"}}>Booking ID: {booking.id}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
                <Text style={styles.text}>
                {getHeader(
                    booking.status,
                    booking.start,
                    booking.startTime,
                    booking.end,
                    booking.endTime,
                )}
                </Text>
                <Text style={styles.text}>
                {formatDateTime(
                    booking.status === "Upcoming" ? booking.start : booking.end,
                )}
                </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.textHeading}>Vehicle Information</Text>
              <Text style={styles.text}>{booking.carName}</Text>
              <Text style={styles.text}>{booking.carPlateNumber}</Text>
            </View>
            
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.textHeading}>Booking Period</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={{...styles.text,...styles.bold}}>From:</Text>
              <Text style={styles.text}>{formatDateTime(booking.start)} {booking.startTime}</Text>
            </View>
            <View style={styles.column}>
              <Text style={{...styles.text,...styles.bold}}>To:</Text>
              <Text style={styles.text}>{formatDateTime(booking.end)} {booking.endTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.textHeading}>Customer Information</Text>
          <View style={styles.row}>
            <View>
                <View style={{display:"flex",flexDirection:"row"}}>
                    <Text style={{...styles.text,...styles.bold}}>Name: </Text>
                    <Text style={styles.text}>{booking.customerName}</Text>
                </View>
                <View style={{display:"flex",flexDirection:"row"}}>
                    <Text style={{...styles.text,...styles.bold}}>Contact: </Text>
                    <Text style={styles.text}>{booking.customerContact}</Text>
                </View>
            </View>
            <View >
                {booking.customerAddress && (
                    <View >
                        <Text style={{...styles.text,...styles.bold}}>Address: </Text>
                        <Text style={styles.text}>{booking.customerAddress}</Text>
                    </View>
                )}
            </View>
            <View>
                <Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.textHeading}>Some more details</Text>
          <View >
            <View>
              <View style={{display:"flex",flexDirection:"row"}}>
                  <Text style={{...styles.text,...styles.bold}}>Odometer Reading: </Text>
                  <Text style={styles.text}>{booking.odometerReading} km</Text>
              </View>
            </View>
            <View>
              <View style={{display:"flex",flexDirection:"row"}}>
                  <Text style={{...styles.text,...styles.bold}}>FasTag Amount: </Text>
                  <Image src="/rupee.png" style={{width:12,height:12}} />
                  <Text style={styles.text}>{booking.fastrack} </Text>
              </View>
            </View>
            <View>
              <View style={{display:"flex",flexDirection:"row"}}>
                  <Text style={{...styles.text,...styles.bold}}>FasTag end Amount: </Text>
                  <Image src="/rupee.png" style={{width:12,height:12}} />
                  <Text style={styles.text}>{booking.endfastrack}</Text>
              </View>
            </View>
            <View>
              {booking.notes && (
                  <View style={{display:"flex",flexDirection:"row"}}>
                      <Text style={{...styles.text,...styles.bold}}>Notes: </Text>
                      <Text style={styles.text}>{booking.notes}</Text>
                  </View>
              )}
            </View>
            <View>
              <Text></Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.textHeading}>Payment Details</Text>
          <View>
            <View style={styles.printRow}>
              <Text style={styles.text}>Daily Rate:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                  {booking.dailyRentalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.printRow}>
              <Text style={styles.text}>Duration:</Text>
              <Text style={styles.text}>{(totalAmount/booking.dailyRentalPrice).toFixed(2)} days</Text>
            </View>
            <View style={styles.printRow}>
              <Text style={styles.text}>Delivery charges:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                  {(booking.type === "home delivery" ? 1000 : 0).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.printRow}>
              <Text style={styles.text}>Merchant fees:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                {charge.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.total}>
              <Text style={styles.text}>Total Amount:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                  {(booking.type === "home delivery" ? totalAmount + charge + 1000 : totalAmount + charge).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.printRow}>
              <Text style={styles.text}>Amount Paid:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                {(booking.advancePayment || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.total}>
              <Text style={styles.text}>Amount Remaining:</Text>
              {amountRemaining > 0 ?
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                  {amountRemaining.toFixed(2)}
                </Text>
              </View>
              :
              <Text style={styles.text}>
                  Fully Paid
              </Text>
              }
            </View>
            <View style={{display:"flex",flexDirection:"row"}}>
                <Text style={{...styles.text}}>Security Deposit: </Text>
                <Text style={{...styles.text,fontStyle:"italic"}}>{booking.securityDeposit ? booking.securityDeposit : "No Security Deposit"}</Text>
            </View>
            {booking.fastrack && booking.endfastrack &&
            <View style={styles.printRow}>
              <Text style={styles.text}>FasTag used:</Text>
              <View style={styles.money}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src="/rupee.png" style={{width:12,height:12,marginTop:-2}} />
                <Text style={styles.text}>
                  {booking.fastrack - booking.endfastrack}
                </Text>
              </View>
            </View>
            }
          </View>
        </View>
        </View>
        </View>
        </Page>
        <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
        <View style={styles.innerBorder}>
        <View style={styles.section}>
          <Text style={styles.header}>Terms and Conditions</Text>
          
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>1. Rental Term, Rate & Payment Mode</Text>
            <Text style={styles.termsParagraph}>
              The rental period begins on the date and time specified in the booking. 
              The Vehicle is reserved for these precise dates and times, and any extension is contingent upon availability. 
              Rental charges will be calculated on an hourly or daily basis, according to the agreed-upon rate. 
              A daily limit of 300 KM applies unless `&ldquo;`unlimited KM`&ldquo;` is explicitly stated. 
              The rental policy states that no refunds will be given for vehicles returned early (before the scheduled end time). 
              If a vehicle is returned late, the customer will be charged according to the applicable hourly and daily extension rates. 
              To rent a vehicle, customers must present the original hard copies of their Aadhaar card and a valid driving license to Jain Car Rental. 
              Jain Car Rental will retain one original ID card for the duration of the booking. We assure the renter that their ID card will be kept safe and will not be used for any other activities.
            </Text>
          </View>

          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>2. Ownership & Use of vehicle</Text>
            <Text style={styles.termsParagraph}>
              The vehicle rental agreement grants the Lessee (renter) a temporary right to use the vehicle, which remains the exclusive property of the Lessor (owner). Use is strictly limited to personal, non-commercial purposes. Prohibited uses include all commercial activities, such as ride-sharing (Uber, Lyft), delivery services, sub-leasing, and for-hire transportation (taxi). Violation of these terms is a material default, leading to potential lease termination, vehicle repossession, and liability for damages.
            </Text>
          </View>

          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>3. Prohibited Actions</Text>
            <Text style={styles.termsParagraph}>
              The Vehicle is the exclusive property of Jain Car Rental. The Lessee is strictly forbidden from selling, mortgaging, sub-leasing, renting, or otherwise encumbering the Vehicle to anyone not listed in the booking details without the express consent of Jain Car Rental. Any violation of these terms constitutes a breach of this Agreement, which may result in legal action. In the event of a breach of the terms, Jain Car Rental reserves the right to retrieve the vehicle from any location and return it to its office without prior notice to the person who rented the car.
            </Text>
          </View>

          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>4. Maintenance and Care</Text>
            <Text style={styles.termsParagraph}>
              The Lessee is required to maintain the rented Vehicle in good condition, operate it lawfully, and return it to the Lessor at the end of the Rental Term in the same condition as received, allowing for normal wear and tear.
              The Lessee is held fully financially responsible for any damage to the Vehicle, including collision, theft, or vandalism, that occurs during the Rental 
              Term, regardless of fault. This responsibility covers the full cost of repairs, replacement, towing, storage, and the Lessor`&apos;`s loss of rental income. If the Vehicle is a total loss, the Lessee is liable for its fair market value. 
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>5. Indemnification & Governing Law</Text>
            <Text style={styles.termsParagraph}>
              The Lessee agrees to indemnify and hold harmless the Lessor from any and all claims, damages, losses, or expenses arising out of the Lessee&apos;s use of the Vehicle. This Agreement shall be governed by and construed in accordance with the laws of the state of Ahmedabad, Gujarat.
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>6. Traffic Violation Challan</Text>
            <Text style={styles.termsParagraph}>
              You are responsible for paying any traffic violation fines incurred during your rental period. If you fail to respond to or deny a notice to pay a challan, legal proceedings may be initiated. In such an event, Jain Car Rental reserves the right to visit your registered address to recover the outstanding fine, along with any associated legal expenses.
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>7. Security Deposit</Text>
            <Text style={styles.termsParagraph}>
              Acceptable in terms of cash (5000-10000) and kind (two wheeler) Refundable after return of Car after Inspection. -  Deductions apply for Damage , Fines, Late Return, Traffic Challan, Cleaning charges and Fuel incompleteness.
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>8. Vehicle Return Policy</Text>
            <Text style={styles.termsParagraph}>
              Return Timing and Late Fees:Vehicles must be returned by the agreed-upon time. Advance notification is mandatory for any expected delay. Unnotified late returns are strictly prohibited. Late returns will incur hourly charges calculated based on the standard daily rate. A delay exceeding 4 hours will extend the rental by 12 hours. A delay over 16 hours will result in a charge for an entire additional rental day. Operating Hours: Vehicle pickup and return are permitted only between 9:00 AM and 11:00 PM. Fuel Policy: The rental price does not include fuel, unless explicitly stated otherwise. Vehicles must be returned with the same fuel level as at the time of pickup. Any extra fuel beyond the starting level is non-refundable. Cleaning Fee:A cleaning fee of up to Rs 500/- may be applied if the vehicle is not returned in a clean condition. Premium Car Rental Eligibility: The minimum age requirement for renting Premium Cars is 21 years old.
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>9. Entire Agreement</Text>
            <Text style={styles.termsParagraph}>
              This Agreement constitutes the entire understanding between the parties and supersedes all prior discussions, agreements, or understandings, whether written or oral. The Lessor hereby agrees to rent to the Lessee the following vehicle.
            </Text>
          </View>
          <View style={styles.termsSection}>
            <Text style={styles.termsParagraph}>
              I accept all the terms and conditions stated above.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Jain Car Rentals. All rights reserved.</Text>
        </View>
        </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;