import { useEffect, useRef, useState } from "react";
import { searchAddress } from "../api/geoapifyService";
import "./AddressSearch.css";

function AddressSearch({
  id,
  label,
  placeholder,
  value,
  onLocationSelect,
  icon = "📍",
  required = true,
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      setSearching(false);
      setError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      try {
        setSearching(true);
        setError("");

        const locations = await searchAddress(trimmedQuery);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setResults(locations);
        setIsOpen(true);

        if (locations.length === 0) {
          setError("No matching locations found.");
        }
      } catch (searchError) {
        console.error("Address search failed:", searchError);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setResults([]);
        setIsOpen(true);
        setError("Unable to search locations right now.");
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    setQuery(newValue);
    setError("");

    onLocationSelect({
      address: newValue,
      latitude: "",
      longitude: "",
      selected: false,
    });
  };

  const handleSelect = (location) => {
    setQuery(location.address);
    setResults([]);
    setIsOpen(false);
    setError("");

    onLocationSelect({
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      selected: true,
    });
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError("");

    onLocationSelect({
      address: "",
      latitude: "",
      longitude: "",
      selected: false,
    });
  };

  return (
    <div className="address-search" ref={containerRef}>
      <label htmlFor={id}>
        {label}
        {required && <span>*</span>}
      </label>

      <div className="address-search-input-wrapper">
        <span className="address-search-icon">{icon}</span>

        <input
          id={id}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || error) {
              setIsOpen(true);
            }
          }}
        />

        {searching && (
          <span
            className="address-search-loader"
            aria-label="Searching locations"
          />
        )}

        {!searching && query && (
          <button
            type="button"
            className="address-search-clear"
            onClick={handleClear}
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </div>

      <small>
        Type at least three characters, then select an address from the
        suggestions.
      </small>

      {isOpen && (
        <div className="address-search-results">
          {searching && (
            <div className="address-search-status">
              Searching locations...
            </div>
          )}

          {!searching &&
            results.map((location, index) => (
              <button
                type="button"
                className="address-search-result"
                key={`${location.latitude}-${location.longitude}-${index}`}
                onClick={() => handleSelect(location)}
              >
                <span>📍</span>

                <div>
                  <strong>{location.address}</strong>

                  <small>
                    {Number(location.latitude).toFixed(6)},{" "}
                    {Number(location.longitude).toFixed(6)}
                  </small>
                </div>
              </button>
            ))}

          {!searching && error && (
            <div className="address-search-status error">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressSearch;