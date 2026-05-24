import { createContext, useState, useEffect  } from "react";

const UserContext = createContext(null);

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // optional: load from chrome/localStorage
  useEffect(() => {
    const raw = localStorage.getItem("userData");

    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const updateUser = (data) => {
    setUser(data);
    localStorage.setItem("userData", JSON.stringify(data));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("userData");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: updateUser,
        clearUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};