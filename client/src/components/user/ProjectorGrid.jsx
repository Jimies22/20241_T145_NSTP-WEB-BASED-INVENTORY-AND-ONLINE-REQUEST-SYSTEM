import React, { useState } from 'react';
import '../../css/ProjectorGrid.css';
import BorrowOverlay from './BorrowOverlay';

const ProjectorGrid = ({ searchTerm, selectedFilters }) => {
    const [selectedProjector, setSelectedProjector] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);

    // Sample data - replace with your actual data source
    const projectors = [
        {
            id: 1,
            image: "src/assets/DLP.webp",
            name: "Epson 703HD Powerlite Home Cinema LCD Projector",
            status: "AVAILABLE",
            description: "High-quality LCD projector perfect for home cinema use"
        },
        {
            id: 2,
            image: "src/assets/NSTP_LOGO.png",
            name: "Epson 703HD Powerlite Home Cinema LCD Projector ",
            status: "AVAILABLE",
            description: "High-quality LCD projector perfect for home cinema use"
        },
        {
            id: 3,
            image: "src/assets/tv.png",
            name: "Epson 703HD Powerlite Home Cinema LCD Projector",
            status: "AVAILABLE",
            description: "High-quality LCD projector perfect for home cinema use"
        },
        {
            id: 4,
            image: "src/assets/extension.png",
            name: "Epson 703HD Powerlite Home Cinema LCD Projector",
            status: "AVAILABLE",
            description: "High-quality LCD projector perfect for home cinema use"
        },
        // Add more projectors as needed
    ];

    const filteredProjectors = projectors.filter(projector => {
        const matchesSearch = projector.name.toLowerCase().includes(searchTerm?.toLowerCase() || '');
        const matchesFilter = selectedFilters?.length ? selectedFilters.includes(projector.status.toLowerCase()) : true;
        return matchesSearch && matchesFilter;
    });

    const handleProjectorClick = (projector) => {
        setSelectedProjector(projector);
        setShowOverlay(true);
    };

    const handleCloseOverlay = () => {
        setSelectedProjector(null);
        setShowOverlay(false);
    };

    return (
        <div className="projector-container">
            <div className="projector-grid">
                {filteredProjectors.map(projector => (
                    <div 
                        key={projector.id}
                        className="projector-card" 
                        onClick={() => handleProjectorClick(projector)}
                    >
                        <img src={projector.image} alt={projector.name} />
                        <div className="projector-details">
                            <h3>{projector.name}</h3>
                            <p className={`status ${projector.status.toLowerCase()}`}>
                                {projector.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {showOverlay && selectedProjector && (
                <BorrowOverlay 
                    item={selectedProjector} 
                    onClose={handleCloseOverlay} 
                />
            )}
        </div>
    );
};

export default ProjectorGrid;