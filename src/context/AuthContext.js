import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true); // เริ่มต้นให้เป็น true

  useEffect(() => {
    // เมื่อแอปโหลด ให้ลองดึงข้อมูลผู้ใช้จาก localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ล่าสุดจากเซิร์ฟเวอร์
  const refreshUserData = async () => {
    if (!token) return; // ถ้าไม่มี token ก็ไม่ต้องทำอะไร

    try {
      const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latestUserData = response.data;

      // อัปเดตข้อมูลทั้งใน State และ LocalStorage เพื่อให้ข้อมูลตรงกันเสมอ
      setUser(latestUserData);
      localStorage.setItem("user", JSON.stringify(latestUserData));
    } catch (error) {
      console.error("Failed to refresh user data", error);
      // ถ้า Token หมดอายุหรือใช้ไม่ได้ให้ทำการ logout
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// สร้าง custom hook เพื่อให้ใช้งาน context ได้ง่ายขึ้น
export const useAuth = () => {
  return useContext(AuthContext);
};
