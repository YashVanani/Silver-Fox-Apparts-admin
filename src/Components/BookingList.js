"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../libs/firebase/firebase";
import ConfirmationModal from "./ConfirmationModal";
import { FaRegCircleCheck, FaRegCircleXmark } from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookingsCollectionRef = collection(db, "room_bookings");
  const recordsToFetch = 10;

  // Helper function to format date in MM/DD/YYYY format
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    
    let date;
    
    // Handle Firestore timestamp format
    if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    }
    // Handle regular Date object or timestamp
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Handle string date
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    }
    // Handle timestamp number
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    else {
      return "N/A";
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    // Format as MM/DD/YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  const fetchBookings = async (next = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let q;
      if (next && lastVisible) {
        q = query(
          bookingsCollectionRef,
          orderBy("created_at", "desc"),
          startAfter(lastVisible),
          limit(recordsToFetch)
        );
      } else {
        q = query(
          bookingsCollectionRef,
          orderBy("created_at", "desc"),
          limit(recordsToFetch)
        );
      }

      const documentSnapshots = await getDocs(q);

      if (documentSnapshots.empty) {
        setIsCompleted(true);
        setLoading(false);
        return;
      }

      const newBookings = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setBookings((prevBookings) =>
        next ? [...prevBookings, ...newBookings] : newBookings
      );
    } catch (error) {
      console.error("Error fetching bookings: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const bookingRef = doc(db, "room_bookings", bookingId);
    try {
      await updateDoc(bookingRef, { status: newStatus });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const openConfirmationModal = (bookingId, newStatus) => {
    setSelectedBooking({ id: bookingId, status: newStatus });
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const confirmStatusUpdate = () => {
    if (selectedBooking) {
      handleUpdateStatus(selectedBooking.id, selectedBooking.status);
      closeConfirmationModal();
    }
  };

  const handleNextPage = () => {
    if (!isCompleted) {
      fetchBookings(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Room Booking Management
        </h2>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sr. No.
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Room Type
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-in
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Check-out
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Guests
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking, index) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.room_type}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.check_in)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.check_out)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.guests_count}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === "pending" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            openConfirmationModal(booking.id, "confirmed")
                          }
                          className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                          title="Approve"
                        >
                          <FaRegCircleCheck size={20} />
                        </button>
                        <button
                          onClick={() =>
                            openConfirmationModal(booking.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                          title="Reject"
                        >
                          <FaRegCircleXmark size={20} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet Table View */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sr. No.
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Room Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Dates
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking, index) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.room_type}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>In: {formatDate(booking.check_in)}</div>
                      <div>Out: {formatDate(booking.check_out)}</div>
                      <div className="text-xs text-gray-400">Guests: {booking.guests_count}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === "pending" ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            openConfirmationModal(booking.id, "confirmed")
                          }
                          className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                          title="Approve"
                        >
                          <FaRegCircleCheck size={18} />
                        </button>
                        <button
                          onClick={() =>
                            openConfirmationModal(booking.id, "cancelled")
                          }
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                          title="Reject"
                        >
                          <FaRegCircleXmark size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {bookings.map((booking, index) => (
            <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {booking.room_type}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <p className="text-gray-900">
                      {formatDate(booking.check_in)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <p className="text-gray-900">
                      {formatDate(booking.check_out)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">Guests:</span>
                  <p className="text-gray-900 text-sm">{booking.guests_count}</p>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        openConfirmationModal(booking.id, "confirmed")
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <FaRegCircleCheck size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() =>
                        openConfirmationModal(booking.id, "cancelled")
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <FaRegCircleXmark size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          {!isCompleted && (
            <button
              onClick={handleNextPage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 sm:px-6 rounded-md transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </button>
          )}
          {isCompleted && bookings.length > 0 && (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              No more records to show
            </p>
          )}
          {bookings.length === 0 && !loading && (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              No bookings found
            </p>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmStatusUpdate}
        title="Confirm Status Change"
        message={`Are you sure you want to ${selectedBooking?.status} this booking?`}
      />
    </div>
  );
};

export default BookingList;
