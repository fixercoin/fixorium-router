import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-darker border-t border-border py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <img src="https://i.postimg.cc/c4nxmQGk/fixercoin.png" alt="Fixorium" className="w-6 h-6" />
                            <span className="font-semibold text-primary">Fixorium</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">© 2026 Fixorium. All rights reserved.</p>
                    </div>
                    
                    <div className="flex gap-6">
                        <a href="/max/docs" className="text-sm text-gray-400 hover:text-primary transition">Documentation</a>
                        <a href="https://github.com/fixercoin" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition">GitHub</a>
                        <a href="https://twitter.com/fixorium" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition">Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
