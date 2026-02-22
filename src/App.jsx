import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Landing page sections
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import Pricing from './components/Pricing'
import CTA from './components/CTA'
import Footer from './components/Footer'

// Auth & dashboard pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import ExpiryAlerts from './pages/ExpiryAlerts'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Suppliers from './pages/Suppliers'
import Staff from './pages/Staff'

import './index.css'

function LandingPage() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <div className="glow-divider" />
                <Features />
                <div className="glow-divider" />
                <HowItWorks />
                <Stats />
                <div className="glow-divider" />
                <Pricing />
                <div className="glow-divider" />
                <CTA />
            </main>
            <Footer />
        </>
    )
}

export default function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/inventory" element={
                        <PrivateRoute>
                            <Inventory />
                        </PrivateRoute>
                    } />
                    <Route path="/sales" element={
                        <PrivateRoute>
                            <Sales />
                        </PrivateRoute>
                    } />
                    <Route path="/expiry" element={
                        <PrivateRoute>
                            <ExpiryAlerts />
                        </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                        <PrivateRoute>
                            <Settings />
                        </PrivateRoute>
                    } />
                    <Route path="/reports" element={
                        <PrivateRoute>
                            <Reports />
                        </PrivateRoute>
                    } />
                    <Route path="/suppliers" element={
                        <PrivateRoute>
                            <Suppliers />
                        </PrivateRoute>
                    } />
                    <Route path="/staff" element={
                        <PrivateRoute>
                            <Staff />
                        </PrivateRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
