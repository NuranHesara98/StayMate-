import React, { useState } from "react";
import "./App.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import logo from "./logo.png";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import propertiesData from "./properties.json";

Modal.setAppElement("#root");

function PropertyPopup({ property, onClose }) {
  if (!property) return null;

  const images = property.pictures.map((picture) => ({
    original: picture,
    thumbnail: picture,
  }));

  return (
    <Modal
      isOpen={!!property}
      onRequestClose={onClose}
      contentLabel="Property Details"
      className="property-modal"
      overlayClassName="property-modal-overlay"
    >
      <button className="close-button" onClick={onClose}>X</button>
      <h2>{property.type} - {property.location}</h2>
      <div className="property-details">
        <ImageGallery items={images} />
        <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
        <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
        <p><strong>Tenure:</strong> {property.tenure}</p>
        <p><strong>Postal Code:</strong> {property["Postalcode area"]}</p>
        <p><strong>Added:</strong> {property.added.month} {property.added.day}, {property.added.year}</p>
      </div>
      <div className="tabs-container">
        <div className="tab">
          <h3>Long Description</h3>
          <p>{property.description}</p>
        </div>
        <div className="tab">
          <h3>Floor Plan</h3>
          <img
            src={property.floorPlan}
            alt="Floor Plan"
            className="floor-plan"
            onError={(e) => (e.target.src = "images/default_floorplan.jpg")}
          />
        </div>
        <div className="tab">
          <h3>Location Map</h3>
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Property Location"
          ></iframe>
        </div>
      </div>
    </Modal>
  );
}

function Footer() {
  return (
    <footer className="App-footer">
      <p>&copy; {new Date().getFullYear()} StayMate. All rights reserved.</p>
      <nav className="footer-nav">
        <a href="#!" className="footer-link">Privacy Policy</a>
        <a href="#!" className="footer-link">Terms of Service</a>
        <a href="#!" className="footer-link">Contact Us</a>
      </nav>
    </footer>
  );
}

function App() {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    type: null,
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    maxBedrooms: "",
    postalCodeArea: "",
    addedAfter: null,
  });
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const propertyTypes = [
    { value: "House", label: "House" },
    { value: "Flat", label: "Flat" },
    { value: "Any", label: "Any" },
  ];

  React.useEffect(() => {
    setFilteredProperties(propertiesData.properties);
  }, []);

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch((prev) => !prev);
  };

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    const { type, minPrice, maxPrice, minBedrooms, maxBedrooms, postalCodeArea, addedAfter } = searchCriteria;
    const results = propertiesData.properties.filter((property) => {
      return (
        (!type || property.type === type.value || type.value === "Any") &&
        (minPrice === "" || property.price >= parseInt(minPrice)) &&
        (maxPrice === "" || property.price <= parseInt(maxPrice)) &&
        (minBedrooms === "" || property.bedrooms >= parseInt(minBedrooms)) &&
        (maxBedrooms === "" || property.bedrooms <= parseInt(maxBedrooms)) &&
        (postalCodeArea === "" ||
          property["Postalcode area"].toLowerCase().includes(postalCodeArea.toLowerCase())) &&
        (!addedAfter || new Date(`${property.added.year}-${property.added.month}-${property.added.day}`) >= addedAfter)
      );
    });
    setFilteredProperties(results);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      type: selectedOption,
    }));
  };

  const handleDateChange = (date) => {
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      addedAfter: date,
    }));
  };

  const addToFavorites = (property) => {
    if (!favorites.some((fav) => fav.id === property.id)) {
      setFavorites((prevFavorites) => [...prevFavorites, property]);
    }
  };

  const removeFromFavorites = (property) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.id !== property.id)
    );
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const handleDragStart = (e, property) => {
    e.dataTransfer.setData("property", JSON.stringify(property));
  };

  const handleDropToFavorites = (e) => {
    e.preventDefault();
    const property = JSON.parse(e.dataTransfer.getData("property"));
    addToFavorites(property);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" className="App-logo" />
        <h1>StayMate</h1>
        <p className="subtitle">Your Property Partner</p>
      </header>

      <div className="advanced-search">
        <a
          href="#!"
          onClick={toggleAdvancedSearch}
          className="advanced-search-link"
        >
          {showAdvancedSearch ? "Hide Advanced Search" : "Show Advanced Search"}
        </a>
      </div>

      {showAdvancedSearch && (
        <div className="advanced-search-container">
          <form className="advanced-form" onSubmit={handleAdvancedSearch}>
            <label>Type:</label>
            <Select
              options={propertyTypes}
              value={searchCriteria.type}
              onChange={handleSelectChange}
              placeholder="Select Property Type"
            />
            <label>Price Range:</label>
            <div className="price-range">
              <input
                type="text"
                name="minPrice"
                placeholder="Min Price"
                value={searchCriteria.minPrice}
                onChange={handleInputChange}
              />
              <span>-</span>
              <input
                type="text"
                name="maxPrice"
                placeholder="Max Price"
                value={searchCriteria.maxPrice}
                onChange={handleInputChange}
              />
            </div>
            <label>Bedrooms:</label>
            <div className="bedrooms-range">
              <input
                type="number"
                name="minBedrooms"
                placeholder="Min Bedrooms"
                value={searchCriteria.minBedrooms}
                onChange={handleInputChange}
              />
              <span>-</span>
              <input
                type="number"
                name="maxBedrooms"
                placeholder="Max Bedrooms"
                value={searchCriteria.maxBedrooms}
                onChange={handleInputChange}
              />
            </div>
            <label>Postal Code Area:</label>
            <input
              type="text"
              name="postalCodeArea"
              placeholder="e.g. NW1"
              value={searchCriteria.postalCodeArea}
              onChange={handleInputChange}
            />
            <label>Added After:</label>
            <DatePicker
              selected={searchCriteria.addedAfter}
              onChange={handleDateChange}
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>
      )}

      <div className="main-container">
        <div className="available-container" onDragOver={handleDragOver}>
          <h2>Available Properties</h2>
          <div className="property-list">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="property-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, property)}
                  onClick={() => handlePropertyClick(property)}
                >
                  <img src={property.picture} alt={property.type} />
                  <p><strong>Type:</strong> {property.type}</p>
                  <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                  <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
                  <p><strong>Postal Code:</strong> {property["Postalcode area"]}</p>
                  <p>
                    <strong>Added Date:</strong> {property.added.month} {property.added.day}, {property.added.year}
                  </p>
                  <button
                    className="add-favorites-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(property);
                    }}
                  >
                    Add to Favorites
                  </button>
                </div>
              ))
            ) : (
              <p>No properties match your search criteria.</p>
            )}
          </div>
        </div>

        <div
          className="favorites-container"
          onDragOver={handleDragOver}
          onDrop={handleDropToFavorites}
        >
          <h2>Favorites</h2>
          {favorites.length > 0 && (
            <button className="clear-favorites-btn" onClick={clearFavorites}>
              Clear All
            </button>
          )}
          <div className="property-list">
            {favorites.map((property) => (
              <div key={property.id} className="property-card">
                <img src={property.picture} alt={property.type} />
                <p><strong>Type:</strong> {property.type}</p>
                <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
                <p><strong>Postal Code:</strong> {property["Postalcode area"]}</p>
                <p>
                  <strong>Added Date:</strong> {property.added.month} {property.added.day}, {property.added.year}
                </p>
                <button
                  className="remove-favorites-btn"
                  onClick={() => removeFromFavorites(property)}
                >
                  Remove from Favorites
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PropertyPopup property={selectedProperty} onClose={handleCloseModal} />
      <Footer />
    </div>
  );
}

export default App;
