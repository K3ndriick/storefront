/// <reference types="@types/google.maps" />
import { importLibrary } from "@googlemaps/js-api-loader";
import { useState, useEffect, useRef } from "react";

function useAddressAutocomplete(inputRef: React.RefObject<HTMLInputElement>) {
  const [address, setAddress] = useState({ address_line1: "", city: "", state: "", postal_code: "", country: "" });

  // listener
  useEffect(() => {
    if (!inputRef.current) return;

    let ac : google.maps.places.Autocomplete;

    async function init() {
      const { Autocomplete } = await importLibrary('places');
      ac = new Autocomplete(inputRef.current!, {
        types: ['address'],
        componentRestrictions: { country: 'au' },
        fields: ['address_components']
      });
      
      // ac.addListener('place_changed', () => {

      // });

    }
    init();
    return () => {
      window.google.maps.event.clearInstanceListeners(ac)
    }
  }, [])


  return address;
}
