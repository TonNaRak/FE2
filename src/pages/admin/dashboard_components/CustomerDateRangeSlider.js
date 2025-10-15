import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import { th } from "date-fns/locale";

const DateRangeSlider = ({ onDateRangeChange }) => {
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(new Date());
  const [totalDays, setTotalDays] = useState(0);
  const [values, setValues] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDateLimits = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://api.souvenir-from-lagoon-thailand.com/api/admin/dashboard/customer-date-range-limits",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const startDate = response.data.minDate
          ? parseISO(response.data.minDate)
          : new Date();
        const endDate = new Date(); // วันปัจจุบัน

        setMinDate(startDate);
        setMaxDate(endDate);

        const days = differenceInDays(endDate, startDate);
        setTotalDays(days);
        setValues([0, days]); // เริ่มต้นด้วยการเลือกทั้งหมด

        // ส่งค่าเริ่มต้นออกไป
        onDateRangeChange({ from: startDate, to: endDate });
      } catch (error) {
        console.error("Failed to fetch date limits", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDateLimits();
  }, []); // ทำงานแค่ครั้งเดียวตอนโหลด

  const handleSliderChange = (newValues) => {
    setValues(newValues);
  };

  const handleAfterChange = (finalValues) => {
    const newStartDate = addDays(minDate, finalValues[0]);
    const newEndDate = addDays(minDate, finalValues[1]);
    onDateRangeChange({ from: newStartDate, to: newEndDate });
  };

  if (isLoading) {
    return <p>Loading date range...</p>;
  }

  const startDateLabel = format(addDays(minDate, values[0]), "d MMM yyyy", {
    locale: th,
  });
  const endDateLabel = format(addDays(minDate, values[1]), "d MMM yyyy", {
    locale: th,
  });

  return (
    <div style={{ width: "100%", padding: "0 20px" }}>
      <div className="d-flex justify-content-between mb-2">
        <span className="fw-bold">{startDateLabel}</span>
        <span className="fw-bold">{endDateLabel}</span>
      </div>
      <Slider
        range
        min={0}
        max={totalDays}
        value={values}
        onChange={handleSliderChange}
        onAfterChange={handleAfterChange} // ส่งค่าเมื่อปล่อยเมาส์
        allowCross={false}
        trackStyle={[{ backgroundColor: "#0d6efd" }]}
        handleStyle={[
          { borderColor: "#0d6efd", backgroundColor: "white" },
          { borderColor: "#0d6efd", backgroundColor: "white" },
        ]}
      />
    </div>
  );
};

export default DateRangeSlider;
