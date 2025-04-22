import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateUserData = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const clearUserData = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{ userData, isLoggedIn, updateUserData, clearUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
