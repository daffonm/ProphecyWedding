"use client";

import { useMemo } from "react";

function safeTrim(v) {
  return String(v ?? "").trim();
}

export default function ReservationDetailsPhase({
  // Customer Details
  reservationName,
  setReservationName,
  primaryContactNumber,
  setPrimaryContactNumber,
  groomName,
  setGroomName,
  brideName,
  setBrideName,

  // NEW Customer Fields
  customerCity,
  setCustomerCity,
  customerAddress,
  setCustomerAddress,

  // NEW Payment Fields
  paymentAccount,
  setPaymentAccount,
  paymentAccountName,
  setPaymentAccountName,
  paymentAccountNumber,
  setPaymentAccountNumber,

  // Payment Details
  paymentSystem,
  setPaymentSystem,
  paymentMethod,
  setPaymentMethod,

  onBack,
  onNext,
  error,
}) {
  const SystemLabel = useMemo(() => {
    if (paymentSystem === "dp50") return "DP 50%";
    if (paymentSystem === "full") return "Full Payment";
    return "";
  }, [paymentSystem]);

  const validate = () => {
    if (!safeTrim(reservationName)) return "Reservation name is required.";
    if (!safeTrim(primaryContactNumber)) return "Primary contact number is required.";
    if (!safeTrim(groomName)) return "Groom name is required.";
    if (!safeTrim(brideName)) return "Bride name is required.";

    // NEW
    if (!safeTrim(customerCity)) return "City is required.";
    if (!safeTrim(customerAddress)) return "Address is required.";

    if (!safeTrim(paymentSystem)) return "Please select a payment System.";
    if (!safeTrim(paymentMethod)) return "Please select a payment method.";

    // NEW: bank fields mandatory only when Bank Transfer
    if (safeTrim(paymentMethod) === "Bank Transfer") {
      if (!safeTrim(paymentAccount)) return "Bank name is required for Bank Transfer.";
      if (!safeTrim(paymentAccountName)) return "Account name is required for Bank Transfer.";
      if (!safeTrim(paymentAccountNumber)) return "Account number is required for Bank Transfer.";
    }

    return "";
  };

  const handleNext = async () => {
    const msg = validate();
    if (msg) return onNext({ ok: false, message: msg });

    const draft = {
      reservation_details: {
        customer: {
          reservation_name: safeTrim(reservationName),
          primary_contact_number: safeTrim(primaryContactNumber),
          groom_name: safeTrim(groomName),
          bride_name: safeTrim(brideName),

          city: safeTrim(customerCity), // NEW
          address: safeTrim(customerAddress), // NEW
        },
        payment: {
          payment_system: safeTrim(paymentSystem), // dp50 | full
          payment_method: safeTrim(paymentMethod),

          account: safeTrim(paymentAccount), // NEW
          account_name: safeTrim(paymentAccountName), // NEW
          account_number: safeTrim(paymentAccountNumber), // NEW
        },
      },
    };

    await onNext({ ok: true, draft });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-scroll h-full">
        <div>
          <h2 className="text-2xl">Reservation Details</h2>
          <p>Please complete the details below for your reservation and payment preferences.</p>
        </div>

        {error ? <div className="text-red-600 mt-3">{error}</div> : null}

        <div className="flex flex-col gap-16 mt-10">
          {/* Customer Details */}
          <div className="flex flex-col gap-8">
            <h3 className="text-xl font-semibold">Customer Details</h3>

            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">Reservation Name</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0"
                  type="text"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Enter reservation name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Primary Contact Number</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={primaryContactNumber}
                  onChange={(e) => setPrimaryContactNumber(e.target.value)}
                  placeholder="Phone / WhatsApp number"
                />
              </div>
            </div>

            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">Groom Name</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Enter groom name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Bride Name</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Enter bride name"
                />
              </div>
            </div>

            {/* NEW row */}
            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">City</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Address</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-8">
            <h3 className="text-xl font-semibold">Payment Details</h3>

            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-3 w-80">
                <p className="text-sm">Payment System</p>

                <div className="flex flex-col gap-2">
                  <label className="flex flex-row gap-2 items-center text-sm">
                    <input
                      type="radio"
                      name="paymentSystem"
                      value="dp50"
                      checked={paymentSystem === "dp50"}
                      onChange={(e) => setPaymentSystem(e.target.value)}
                    />
                    DP 50%
                  </label>

                  <label className="flex flex-row gap-2 items-center text-sm">
                    <input
                      type="radio"
                      name="paymentSystem"
                      value="full"
                      checked={paymentSystem === "full"}
                      onChange={(e) => setPaymentSystem(e.target.value)}
                    />
                    Full Payment
                  </label>
                </div>

                {SystemLabel ? <p className="text-xs text-gray-500">Selected: {SystemLabel}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Payment Method</p>
                <select
                  className="bd rounded-lg p-2 w-80 outline-0"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Ovo">Ovo</option>
                  <option value="Dana">Dana</option>
                  <option value="Gopay">Gopay</option>
                  <option value="Shopeepay">ShopeePay</option>
                </select>
              </div>
            </div>

            {/* NEW bank fields */}
            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">Bank Name</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  placeholder="Example: BCA"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm">Account Name</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={paymentAccountName}
                  onChange={(e) => setPaymentAccountName(e.target.value)}
                  placeholder="Example: Propechy Wedding Inc."
                />
              </div>
            </div>

            <div className="flex flex-row gap-40 items-center">
              <div className="flex flex-col gap-2">
                <p className="text-sm">Account Number</p>
                <input
                  className="bd rounded-lg p-2 w-80 outline-0 bg-white"
                  type="text"
                  value={paymentAccountNumber}
                  onChange={(e) => setPaymentAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                />
              </div>

              <div className="w-80" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-row justify-end gap-8">
          <button className="button1 w-50 rounded-lg" onClick={onBack} type="button">
            Back
          </button>
          <button className="button2 w-50 rounded-lg" type="button" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
