import React from "react";

function ProjectorGrid({ searchTerm, selectedFilters, onItemClick }) {
  // This would typically come from an API or props
  const projectors = [
    {
      id: 1,
      image: "/img/DLP.webp",
      title: "Epson 703HD Powerlite Home Cinema LCD Projector",
      status: "AVAILABLE",
    },
    // Add more projectors...
  ];

  const filteredProjectors = projectors.filter((projector) => {
    const matchesSearch = projector.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilters.includes(
      projector.status.toLowerCase()
    );
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="projector-grid">
      {filteredProjectors.map((projector) => (
        <div
          key={projector.id}
          className="projector-card"
          onClick={() => onItemClick(projector)}
        >
          <img src={projector.image} alt={projector.title} />
          <div className="projector-details">
            <h3>{projector.title}</h3>
            <p className={`status ${projector.status.toLowerCase()}`}>
              {projector.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectorGrid;
