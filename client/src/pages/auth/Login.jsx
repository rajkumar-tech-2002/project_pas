import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ChevronDown, GraduationCap, ShieldCheck, ArrowRight, Clock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginUser } from '../../services/authService';
import { toast } from 'sonner';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Staff');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await loginUser(username, password, role);
            if (user) {
                if (role === 'Admin') {
                    navigate('/admin');
                } else {
                    navigate('/user');
                }
            }
        } catch (err) {
            toast.error('Invalid username or password. Please check your credentials and try again.');
        }
    };

    return (
        <div className="login-screen shadow-lg">
            {/* Image Side (Left) */}
            <div className="login-image-side">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <span className="badge bg-secondary px-3 py-2 rounded-pill mb-4 text-uppercase tracking-widest fw-bold">Official Administration</span>
                        <h1 className="display-4 fw-extrabold text-white mb-4">Streamline Your Academic Schedule</h1>
                        <p className="fs-4 text-white-50 leading-relaxed mb-5">
                            Experience the next generation of college administration. Seamlessly manage appointments, track availability, and foster academic excellence.
                        </p>
                        <div className="d-flex gap-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                    <ShieldCheck size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="fw-bold">Secure</div>
                                    <div className="small text-white-50">Authorized Access Only</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                                    <Clock size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className="fw-bold">Real-time</div>
                                    <div className="small text-white-50">Live Slot Management</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    src="/login_academic_hero_1770008693316.png"
                    alt="Principal's Office"
                />
            </div>

            {/* Form Side (Right) */}
            <div className="login-form-side">
                <div className="w-100 fade-in" style={{ maxWidth: '600px' }}>
                    <div className="mb-5 text-center text-lg-start">
                        <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3">
                            <div className="bg-primary-navy p-3 rounded-4 me-3">
                                <GraduationCap size={32} className="text-white" />
                            </div>
                            <h2 className="fw-extrabold mb-0 text-primary-navy">PAS Portal</h2>
                        </div>
                        <p className="text-muted fs-5">Welcome back! Access your secure administrative dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="form-label fw-bold text-uppercase tracking-widest small text-muted text-start d-block">Portal Access Role</label>
                            <div className="position-relative">
                                <ShieldCheck className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary-navy opacity-50" size={18} />
                                <select
                                    className="form-select ps-5 py-3 border-2"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Admin">Principal's Office (Admin)</option>
                                    <option value="Staff">Staff Portal</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold text-uppercase tracking-widest small text-muted text-start d-block">Username / Identity</label>
                            <div className="position-relative">
                                <User className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary-navy opacity-50" size={18} />
                                <input
                                    type="text"
                                    className="form-control ps-5 py-3 border-2"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="form-label fw-bold text-uppercase tracking-widest small text-muted text-start d-block">Security PIN / Password</label>
                            <div className="position-relative">
                                <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-primary-navy opacity-50" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control ps-5 pe-5 py-3 border-2"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ zIndex: 10 }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary-navy w-100 py-3 fw-bold text-uppercase tracking-widest d-flex align-items-center justify-content-center border-0 rounded-4"
                        >
                            Secure Login <ArrowRight size={20} className="ms-2" />
                        </button>
                    </form>

                    <div className="mt-5 pt-4 border-top">
                        <p className="small text-muted mb-0 text-center text-lg-start">
                            © 2026 SmartNandha. All rights reserved.
                            <br />Developed by: <strong>Rajkumar Anbazhagan</strong>
                            <br />Authorized personnel access only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
