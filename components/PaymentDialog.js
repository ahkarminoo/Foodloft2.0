import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function PaymentDialog({ bookingDetails, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    const calculatePrice = async () => {
      try {
        setIsLoadingPrice(true);

        let formattedTime = bookingDetails.time;
        if (formattedTime && formattedTime.includes(' - ')) {
          const [startTime] = formattedTime.split(' - ');
          const [time, period] = startTime.trim().split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: bookingDetails.restaurantId,
            tableId: bookingDetails.tableId,
            date: bookingDetails.date,
            time: formattedTime,
            guestCount: bookingDetails.guestCount,
            tableCapacity: bookingDetails.tableCapacity || 4,
            tableLocation: bookingDetails.tableLocation || 'center'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPricing(data);
            return;
          }
        }

        setPricing({ success: true, finalPrice: 100, currency: 'THB' });
      } catch (error) {
        setPricing({ success: true, finalPrice: 100, currency: 'THB' });
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculatePrice();
  }, [bookingDetails]);

  const tablePrice = pricing?.finalPrice || 100;

  const handleContinue = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success('Booking submitted as pending confirmation.');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-md mx-auto animate-fade-up max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-auto">
        <div className="border-b border-gray-100 p-3 sm:p-4 flex justify-between items-center flex-shrink-0 bg-white">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Review Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors text-xl sm:text-2xl font-light p-1 rounded-full hover:bg-gray-100 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            x
          </button>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Booking Summary</h4>
            <div className="space-y-1 text-xs sm:text-sm text-gray-600">
              <p>Date: {new Date(bookingDetails.date).toLocaleDateString()}</p>
              <p>Time: {bookingDetails.time}</p>
              <p>Table: {bookingDetails.tableId}</p>
              <p>Guests: {bookingDetails.guestCount}</p>
              <p>Duration: {bookingDetails.durationMinutes || 120} minutes</p>
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-base font-medium text-gray-800">Estimated Fee</span>
                {isLoadingPrice ? (
                  <span className="text-sm text-gray-500 flex items-center gap-2"><FaSpinner className="animate-spin" />Calculating...</span>
                ) : (
                  <span className="text-base font-bold text-[#FF4F18]">{tablePrice} THB</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-orange-50 border border-orange-200 rounded-lg p-3">
            Online payment is temporarily disabled. Your reservation will be submitted and await restaurant confirmation.
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className="px-5 py-2 rounded-lg bg-[#FF4F18] text-white hover:bg-[#E74614] disabled:opacity-60 inline-flex items-center gap-2"
          >
            {isProcessing ? <FaSpinner className="animate-spin" /> : null}
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
