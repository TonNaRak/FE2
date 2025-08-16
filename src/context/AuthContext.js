import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; // 1. Import axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // 2. ย้าย Logic ของ Interceptor เข้ามาไว้ใน useEffect
  useEffect(() => {
    // Interceptor สำหรับใส่ Token ในทุก Request
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor สำหรับจัดการเมื่อ Token หมดอายุ
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // ตรวจสอบว่าเป็น lỗi 401 และยังไม่ได้ลอง retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              logout(); // ถ้าไม่มี refreshToken ก็ logout เลย
              return Promise.reject(error);
            }
            // ส่ง request ไปขอ accessToken ใหม่
            const res = await axios.post(
              "https://api.souvenir-from-lagoon-thailand.com/api/token/refresh",
              { refreshToken }
            );

            if (res.status === 200) {
              const newAccessToken = res.data.accessToken;
              localStorage.setItem("accessToken", newAccessToken);
              setAccessToken(newAccessToken);
              axios.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;
              originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
              return axios(originalRequest); // เรียก request เดิมซ้ำอีกครั้ง
            }
          } catch (refreshError) {
            logout(); // ถ้าการขอ token ใหม่ล้มเหลว ให้ logout
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function: จะทำงานเมื่อ component ถูก unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []); // ใส่ [] เพื่อให้ useEffect ทำงานแค่ครั้งเดียว

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [accessToken]);


  // 3. อัปเดตฟังก์ชัน login
  const login = (userData, newAccessToken, newRefreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken); // เก็บ refreshToken ด้วย
    setUser(userData);
    setAccessToken(newAccessToken);
  };

  // 4. อัปเดตฟังก์ชัน logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // ลบ refreshToken ด้วย
    setUser(null);
    setAccessToken(null);
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = '/login';
  };

  const refreshUserData = async () => {
      if(!accessToken) return;
      try {
          const response = await axios.get("https://api.souvenir-from-lagoon-thailand.com/api/user/profile");
          const latestUserData = response.data;
          setUser(latestUserData);
          localStorage.setItem("user", JSON.stringify(latestUserData));
      } catch (error) {
          console.error("Failed to refresh user data", error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              logout();
          }
      }
  };


  return (
    <AuthContext.Provider
      value={{ user, token: accessToken, loading, login, logout, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};