import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';

type Page = 'home' | 'dashboard' | 'apikeys';

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
        setUserEmail('');
        setIsLoggedIn(false);
        setCurrentPage('home');
    };

    return (
        <div className="min-h-screen bg-dark">
            {currentPage === 'home' && (
                <Home 
                    setCurrentPage={setCurrentPage} 
                    onConnect={() => {}}
                    isLoggedIn={isLoggedIn}
                    walletAddress={userEmail}
                    onLogout={handleLogout}
                />
            )}
            {currentPage === 'dashboard' && isLoggedIn && <Dashboard walletAddress={userEmail} />}
            {currentPage === 'apikeys' && isLoggedIn && <ApiKeys />}
        </div>
    );
};

export default App;
