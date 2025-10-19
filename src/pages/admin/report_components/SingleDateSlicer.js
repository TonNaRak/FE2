import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { format } from "date-fns";

const SingleDateSlicer = ({ defaultDate = new Date(), onDateChange, title = "เลือกวันที่" }) => {
  const [date, setDate] = useState(defaultDate);

  useEffect(() => {
    if (onDateChange && date) onDateChange(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <Card className="mb-3">
      <Card.Body className="d-flex align-items-end gap-3 flex-wrap">
        <div>
          <div className="text-muted small">{title}</div>
          <Form.Control
            type="date"
            value={format(date, "yyyy-MM-dd")}
            onChange={(e) => {
              const v = e.target.value;
              if (v) setDate(new Date(`${v}T00:00:00`));
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default SingleDateSlicer;
