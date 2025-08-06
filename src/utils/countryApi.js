// Fetch countries from REST Countries API
export const fetchCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,idd,cca2')
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries')
    }
    
    const countries = await response.json()
    
    // Format and filter countries with valid phone codes
    const formattedCountries = countries
      .filter(country => country.idd && country.idd.root)
      .map(country => ({
        name: country.name.common,
        code: country.cca2,
        flag: country.flag,
        dialCode: country.idd.root + (country.idd.suffixes?.[0] || ''),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    
    return formattedCountries
  } catch (error) {
    console.error('Error fetching countries:', error)
    // Return fallback data if API fails
    return getFallbackCountries()
  }
}

// Fallback country data in case API fails
const getFallbackCountries = () => [
  { name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dialCode: '+44' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dialCode: '+1' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dialCode: '+61' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dialCode: '+49' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dialCode: '+33' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', dialCode: '+81' },
  { name: 'China', code: 'CN', flag: '🇨🇳', dialCode: '+86' },
  { name: 'India', code: 'IN', flag: '🇮🇳', dialCode: '+91' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', dialCode: '+55' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', dialCode: '+52' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', dialCode: '+82' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', dialCode: '+39' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', dialCode: '+34' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', dialCode: '+31' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪', dialCode: '+46' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', dialCode: '+47' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', dialCode: '+45' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮', dialCode: '+358' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺', dialCode: '+7' }
]

// Search countries by name or dial code
export const searchCountries = (countries, query) => {
  if (!query.trim()) return countries
  
  const lowerQuery = query.toLowerCase()
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.dialCode.includes(query) ||
    country.code.toLowerCase().includes(lowerQuery)
  )
}