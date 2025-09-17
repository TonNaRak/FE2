import React from "react";
import { Container } from "react-bootstrap";
import "./DashboardPage.css";

const DashboardPage = () => {
  return (
    <Container fluid className="dashboard-page-container">
      {/* ลบ div ที่ครอบ iframe ออกไปได้เลย */}
      <iframe
        title="project"
        className="dashboard-iframe" 
        src="https://app.powerbi.com/view?r=eyJrIjoiOThmNGI2NDQtNTcyNy00N2NjLTgyMDItMjU1ZDA3ZTY4OTFlIiwidCI6IjhlNjM0ZTY3LTlkNjYtNDZkMi1hNTI5LWUxYjcwOGM1ZDhiYyIsImMiOjEwfQ%3D%3D&pageName=5830365041f6d3ca8de7"
        allowFullScreen={true}
      ></iframe>
    </Container>
  );
};

export default DashboardPage;