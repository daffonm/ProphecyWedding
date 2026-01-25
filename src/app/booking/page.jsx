"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";

export default function Booking() {
    const router = useRouter();

    const [bookingPhase, setBookingPhase] = useState(1);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [bridegroom, setBridegroom] = useState("");
    const [bride, setBride] = useState("");

    const [packageList, setPackageList] = useState("basic");

    const [venue, setVenue] = useState("");
    const [weddingDate, setWeddingDate] = useState("");

    const [paymentSystem, setPaymentSystem] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [cvv, setCvv] = useState("");

    const [completed, setCompleted] = useState(false);

    const handlePhase = (phase) => {
        if (phase >= 5) {
            setCompleted(true);
            if (completed) {
                setBookingPhase(5);
            }
        } else {
            setBookingPhase(phase);
        }
    }

    return (
        <div>
            {/* left */}
            <div></div>
            {/* right */}
            <div>
                {/* Booking Form */}
                <div>
                    {bookingPhase === 1 && (
                        <>
                            <h2>Choose a Package</h2>
                            <div>
                                <div>
                                    <label htmlFor="name">Package</label>
                                    <select id="package" name="package" onChange={(e) => setPackageList(e.target.value)} value={packageList}>
                                        <option value="basic">Basic Package</option>
                                        <option value="standard">Standard Package</option>
                                        <option value="premium">Premium Package</option>
                                    </select>
                                </div>
                                <button className="button1"
                                onClick={() => handlePhase(2)}>Next</button>
                            </div>
                        </>
                    )}
                    {bookingPhase === 2 && (
                        <>
                            <h2>Choose a Venue</h2>
                            <div>
                                <div>
                                    <label htmlFor="name">Venue</label>
                                    <select id="venue" name="venue">
                                        <option value="basic">Venue A</option>
                                        <option value="standard">Venue B</option>
                                        <option value="premium">Venue C</option>
                                    </select>
                                </div>
                            </div>
                            <h2>Set a Wedding Date</h2>
                            <div>
                                <div>
                                    <label htmlFor="date">Wedding Date</label>
                                    <input type="date" id="date" name="date" />
                                </div>
                            </div>
                                <button className="button1"
                                onClick={() => handlePhase(1)}>Back</button>
                                <button className="button1"
                                onClick={() => handlePhase(3)}>Next</button>
                        </>
                    )}
                    {bookingPhase === 3 && (
                        <>
                            <h2>Make a Reservation</h2>
                            <div>
                                <div>
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" name="name" placeholder="Your Full Name" 
                                    onChange={(e) => setName(e.target.value)}/>
                                </div>

                                <div>
                                    <label htmlFor="email">Phone Number</label>
                                    <input type="tel" id="email" name="email" placeholder="Your Phone Number" 
                                    onChange={(e) => setPhone(e.target.value)} /> 
                                </div>
                                <div>
                                    <label htmlFor="date">Bridegroom</label>
                                    <input type="text" id="date" name="date" placeholder="Bridegroom's Name" 
                                    onChange={(e) => setBridegroom(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="date">Bride</label>
                                    <input type="text" id="date" name="date" placeholder="Bride's Name" 
                                    onChange={(e) => setBride(e.target.value)} />
                                </div>
                                <button className="button1"
                                onClick={() => handlePhase(2)}>Back</button>
                                <button className="button1"
                                onClick={() => handlePhase(4)}>Next</button>
                            </div> 
                        </>
                    )}
                    {bookingPhase === 4 && (
                        <>
                            <h2>Payment Details</h2>
                            <div>
                                <div>
                                    <label htmlFor="name">Payment System</label>
                                    <input type="radio" name="full" id="1" />
                                    <label htmlFor="full">Full Payment</label>
                                    <input type="radio" name="installment" id="2" />
                                    <label htmlFor="installment">DP 50%</label>
                                </div>
                                <div>
                                    <label htmlFor="name">Payment Method</label>
                                    <select id="payment" name="payment">
                                        <option value="dana">Dana</option>
                                        <option value="ovo">OVO</option>
                                        <option value="gopay">Gopay</option>
                                        <option value="banktransfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="name">CVV</label>
                                    <input type="text" id="cvv" name="cvv" placeholder="CVV" />
                                </div>
                            </div>
                            <button className="button1"
                            onClick={() => handlePhase(3)}>Back</button>
                            <button className="button1"
                            onClick={() => handlePhase(5)}>Submit Reservation</button>
                        </>
                    )}
                    {bookingPhase === 5 && (
                        <>
                            <h2>Reservation Completed</h2>
                            <p>Thank you for your reservation!</p>
                            <p>Please Wait for Our Confirmation</p>
                            <button className="button1"
                            onClick={() => router.push("/")}>Go to Home</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}