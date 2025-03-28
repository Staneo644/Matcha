require 'geocoder'

Geocoder.configure(
  timeout: 5,
  lookup: :nominatim,
  units: :km
)