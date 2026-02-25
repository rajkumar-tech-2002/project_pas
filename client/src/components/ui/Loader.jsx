import React from 'react';

const Loader = ({ show = true, text = 'Loading...' }) => {
    if (!show) return null;

    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary-navy mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted fw-bold">{text}</p>
        </div>
    );
};

export default Loader;
