//import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import TripPage from './pages/TripPage';
import TripDetailsPage from './pages/TripDetailsPage';
import ResetPassPage from './pages/ResetPassPage';
import VerifyEmailPage from './pages/VerifyEmailPage';


function App() {
  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginPage/>}/>
        <Route path="/trips" element={<TripPage/>}/>
        <Route path="/trip/:tripId" element={<TripDetailsPage/>}/>
        <Route path="/api/reset-password" element={<ResetPassPage/>}/>
        <Route path="/verify-email" element={<VerifyEmailPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>  
    </Router>
  );
}
export default App;
