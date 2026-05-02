import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import UserDashboard from './pages/UserDashboard';  // Changed from Dashboard
import ApiKeys from './pages/ApiKeys';

type Page = 'home' | 'products' | 'userdashboard' | 'apikeys';  // Changed from 'dashboard'

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('user_email');
        const isRegistered = localStorage.getItem('user_registered');
        
        if (savedEmail && isRegistered === 'true') {
            setUserEmail(savedEmail);
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_registered');
        localStorage.removeItem('max_api_key');
        localStorage.removeItem('max_api_secret');
        localStorage.removeItem('mintme_contract');
        localStorage.removeItem('max_program_id');
        setUserEmail('');
        setIsLoggedIn(false);
        setCurrentPage('home');
    };

    return (
        <div className="min-h-screen bg-dark">
            <main className="pt-0">
                {currentPage === 'home' && (
                    <Home 
                        setCurrentPage={setCurrentPage} 
                        onConnect={() => {}}
                        isLoggedIn={isLoggedIn}
                        walletAddress={userEmail}
                        onLogout={handleLogout}
                    />
                )}
                {currentPage === 'products' && <Products />}
                {currentPage === 'userdashboard' && isLoggedIn && <UserDashboard walletAddress={userEmail} />}  {/* Changed to userdashboard */}
                {currentPage === 'apikeys' && isLoggedIn && <ApiKeys walletAddress={userEmail} />}
                
                {currentPage === 'userdashboard' && !isLoggedIn && (  // Changed to userdashboard
                    <div className="max-w-md mx-auto mt-20 p-8 bg-card border border-border rounded-xl text-center">
                        <p className="text-gray-400 mb-4">Please login to access the dashboard</p>
                        <button 
                            onClick={() => setCurrentPage('home')} 
                            className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-[#e8d58a] transition"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
