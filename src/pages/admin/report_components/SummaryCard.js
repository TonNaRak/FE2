import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import './SummaryCard.css';

const SummaryCard = ({ title, value, icon, isLoading, formatAsCurrency = false }) => {
  const formattedValue = () => {
    if (isLoading) return <Spinner animation="border" size="sm" />;
    if (typeof value !== 'number') return 'N/A';
    if (formatAsCurrency) {
      return value.toLocaleString('th-TH', {
        style: 'currency', currency: 'THB',
        minimumFractionDigits: 0, maximumFractionDigits: 0
      });
    }
    return value.toLocaleString('th-TH');
  };

  return (
    <Card className="summary-card h-100">
      <Card.Body>
        <div className="card-content-wrapper">
          <div className="text-content">
            <h6 className="card-subtitle text-muted">{title}</h6>
            <h4 className="card-value mb-0">{formattedValue()}</h4>
          </div>
          <div className="icon-content">
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SummaryCard;
