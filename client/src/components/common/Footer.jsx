import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-top py-3 mt-auto">
            <div className="container text-center">
                <p className="text-muted mb-0 small">
                    &copy; {new Date().getFullYear()} Principal Appointment Management System.
                </p>
                <p className="text-muted mb-0 small fst-italic">
                    Developed by: Rajkumar Anbazhagan
                </p>
            </div>
        </footer>
    );
};

export default Footer;
