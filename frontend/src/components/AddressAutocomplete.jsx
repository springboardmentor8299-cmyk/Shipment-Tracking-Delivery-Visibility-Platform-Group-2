import { useEffect, useRef, useState } from "react";
import "../styles/AddressAutocomplete.css";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

/**
 * Text input with a live address suggestions dropdown (Geoapify Autocomplete API).
 *
 * Behaves like a plain controlled <input> (same name/value/onChange contract),
 * so it's a drop-in replacement for a text field, but also shows a dropdown of
 * matching real-world addresses as the user types, and lets them click one to fill it in.
 */
function AddressAutocomplete({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const skipNextFetchRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Don't re-fetch suggestions right after the user picked one from the list
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = (value || "").trim();
    if (query.length < 3 || !GEOAPIFY_KEY) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query,
          )}&format=json&apiKey=${GEOAPIFY_KEY}`,
        );
        const data = await response.json();
        const results = data?.results || [];
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Address autocomplete failed:", err);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const selectSuggestion = (suggestion) => {
    skipNextFetchRef.current = true;
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    onChange({
      target: {
        name,
        value: suggestion.formatted,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="address-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        required={required}
        autoComplete="off"
        className={className}
        onChange={onChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
      />
      {loading && <span className="address-autocomplete-spinner" />}

      {showDropdown && suggestions.length > 0 && (
        <ul className="address-autocomplete-dropdown">
          {suggestions.map((s, idx) => (
            <li
              key={s.place_id || idx}
              className={idx === highlightedIndex ? "active" : ""}
              onMouseDown={(e) => {
                // onMouseDown fires before the input's onBlur, so the click registers
                e.preventDefault();
                selectSuggestion(s);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              <span className="address-autocomplete-main">
                {s.address_line1 || s.formatted}
              </span>
              {s.address_line2 && (
                <span className="address-autocomplete-secondary">
                  {s.address_line2}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressAutocomplete;
