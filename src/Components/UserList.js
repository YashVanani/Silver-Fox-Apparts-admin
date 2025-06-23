"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../libs/firebase/firebase";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const usersCollectionRef = collection(db, "hotel_users");
  const recordsToFetch = 10;

  const fetchUsers = async (next = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let q;
      if (next && lastVisible) {
        q = query(
          usersCollectionRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(recordsToFetch)
        );
      } else {
        q = query(
          usersCollectionRef,
          orderBy("createdAt", "desc"),
          limit(recordsToFetch)
        );
      }

      const documentSnapshots = await getDocs(q);

      if (documentSnapshots.empty) {
        setIsCompleted(true);
        setLoading(false);
        return;
      }

      const newUsers = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setUsers((prevUsers) => (next ? [...prevUsers, ...newUsers] : newUsers));
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNextPage = () => {
    if (!isCompleted) {
      fetchUsers(true);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Users Management
        </h2>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                  Full Name
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.fullname}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(
                          user.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {users.map((user, index) => (
            <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-xs text-gray-400">
                  {user.createdAt
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {user.fullname}
              </h3>
              <p className="text-sm text-gray-600 break-all">
                {user.email}
              </p>
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
          {isCompleted && users.length > 0 && (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              No more records to show
            </p>
          )}
          {users.length === 0 && !loading && (
            <p className="text-center text-gray-500 text-sm sm:text-base">
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
