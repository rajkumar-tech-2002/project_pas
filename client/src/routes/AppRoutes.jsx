import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import Login from '../pages/auth/Login';
import UserDashboard from '../pages/user/UserDashboard';
import BookAppointment from '../pages/user/BookAppointment';
import MyAppointments from '../pages/user/MyAppointments';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllAppointments from '../pages/admin/AllAppointments';
import AvailabilityManagement from '../pages/admin/AvailabilityManagement';
import SlotManagement from '../pages/admin/SlotManagement';
import Reports from '../pages/admin/Reports';
import RescheduleAppointment from '../pages/admin/RescheduleAppointment';

// Simple simulated auth check
const PrivateRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped in MainLayout */}
            <Route element={
                <PrivateRoute>
                    <MainLayout />
                </PrivateRoute>
            }>
                {/* User Routes */}
                <Route path="/user" element={
                    <PrivateRoute allowedRoles={['Staff']}>
                        <UserDashboard />
                    </PrivateRoute>
                } />
                <Route path="/user/book" element={
                    <PrivateRoute allowedRoles={['Staff']}>
                        <BookAppointment />
                    </PrivateRoute>
                } />
                <Route path="/user/my-appointments" element={
                    <PrivateRoute allowedRoles={['Staff']}>
                        <MyAppointments />
                    </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/admin/all" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <AllAppointments />
                    </PrivateRoute>
                } />
                <Route path="/admin/availability" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <AvailabilityManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/slots" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <SlotManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/reports" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <Reports />
                    </PrivateRoute>
                } />
                <Route path="/admin/reschedule/:id" element={
                    <PrivateRoute allowedRoles={['Admin']}>
                        <RescheduleAppointment />
                    </PrivateRoute>
                } />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;
