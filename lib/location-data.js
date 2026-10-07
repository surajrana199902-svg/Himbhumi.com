export const LEGACY_LOCATION_NAMES = [
  'Nalagarh', 'Baddi', 'Solan', 'Shimla', 'Kasauli', 'Parwanoo',
  'Dharamshala', 'Kangra', 'Palampur', 'Manali', 'Kullu', 'Mandi',
  'Hamirpur', 'Bilaspur', 'Una', 'Chamba', 'Nahan', 'Narkanda',
]

export const HIMACHAL_DISTRICTS = [
  'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu',
  'Lahaul & Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una',
]

export const ADDITIONAL_NORTH_INDIAN_STATES = [
  { id: 'legacy-state-punjab', name: 'Punjab' },
  { id: 'legacy-state-uttarakhand', name: 'Uttarakhand' },
  { id: 'legacy-state-haryana', name: 'Haryana' },
  { id: 'legacy-state-chandigarh', name: 'Chandigarh' },
]

export const INDIAN_STATES_AND_UNION_TERRITORIES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

export const NORTH_INDIAN_LOCATION_DATA = [
  {
    state: 'Chandigarh',
    districts: [
      {
        name: 'Chandigarh',
        cities: [
          { name: 'Chandigarh', localities: ['Sectors 1-63', 'Manimajra', 'Industrial Area Phase 1', 'Industrial Area Phase 2', 'IT Park', 'Madhya Marg', 'Sec 17 Plaza', 'Sec 22 Market'] },
          { name: 'Manimajra', localities: ['Manimajra Market', 'Railway Colony', 'Daria', 'Vikas Nagar'] },
          { name: 'IT Park', localities: ['Rajiv Gandhi Chandigarh Technology Park', 'Elante area', 'Chandigarh University Road'] },
        ],
      },
      {
        name: 'Mohali',
        cities: [
          { name: 'Mohali', localities: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8', 'Phase 9', 'Phase 10', 'Phase 11', 'Sectors 66-127', 'Aerocity', 'IT City', 'New Chandigarh', 'Mullanpur', 'Kharar', 'Kurali'] },
          { name: 'Kharar', localities: ['Kharar Market', 'Bharatgarh Road', 'Mullanpur Road'] },
          { name: 'Kurali', localities: ['Kurali Bus Stand', 'Sohana Road', 'Bharatgarh'] },
          { name: 'Zirakpur', localities: ['VIP Road', 'Dhakoli', 'Baltana', 'Pratap Nagar', 'Rajpura Road'] },
          { name: 'Dera Bassi', localities: ['Dera Bassi town', 'Bhabat', 'Mundali'] },
          { name: 'Lalru', localities: ['Lalru Industrial Area', 'Gharuan'] },
        ],
      },
      {
        name: 'Panchkula',
        cities: [
          { name: 'Panchkula', localities: ['Sectors 1-32', 'MDC', 'Sector 5', 'Sector 10', 'Sector 20', 'Kalka Highway'] },
          { name: 'Pinjore', localities: ['Pinjore Gardens', 'Mughal Gardens', 'Baddi Road'] },
          { name: 'Kalka', localities: ['Kalka Market', 'Parwanoo Road', 'Kalka Railway Station'] },
          { name: 'Barwala', localities: ['Barwala Chowk', 'Naraingarh Road'] },
        ],
      },
    ],
  },
  {
    state: 'Punjab',
    districts: [
      { name: 'Ludhiana', cities: [{ name: 'Ludhiana', localities: ['Civil Lines', 'Model Town', 'Ferozepur Road', 'Pakhowal Road', 'Sarabha Nagar', 'Gill Road', 'Bharat Nagar', 'Mullanpur Dakha'] }] },
      { name: 'Amritsar', cities: [{ name: 'Amritsar', localities: ['Hall Bazaar', 'Ranjit Avenue', 'Airport Road', 'Putligarh', 'Batala Road', 'Lawrence Road'] }] },
      { name: 'Jalandhar', cities: [{ name: 'Jalandhar', localities: ['Model Town', 'Lajpat Nagar', 'Basti Bawa Khel', 'Madhopuri', 'Nakodar Road'] }, { name: 'Phagwara', localities: ['Phagwara Town', 'Hoshiarpur Road', 'Sultanpur Lodhi Road'] }, { name: 'Kapurthala', localities: ['Kapurthala City', 'Bholath Road'] }] },
      { name: 'Patiala', cities: [{ name: 'Patiala', localities: ['Urban Estate', 'Rajindra Nagar', 'Lehal', 'Tripuri', 'Model Town'] }, { name: 'Rajpura', localities: ['Rajpura Town', 'Bassi Pathana Road'] }] },
      { name: 'Bathinda', cities: [{ name: 'Bathinda', localities: ['Model Town', 'Rampura Phul Road', 'Bhucho Road', 'Mandi Town'] }, { name: 'Moga', localities: ['Moga City', 'Badhni Kalan Road'] }, { name: 'Batala', localities: ['Batala market', 'Qadian Road'] }] },
      { name: 'Rupnagar', cities: [{ name: 'Rupnagar', localities: ['Ropar Town', 'Nangal', 'Kiratpur Sahib'] }, { name: 'Mohali', localities: ['Phase 1', 'IT City', 'Aerocity', 'Mullanpur'] }] },
      { name: 'Hoshiarpur', cities: [{ name: 'Hoshiarpur', localities: ['Hoshiarpur City', 'Tanda Road', 'Madhopur'] }, { name: 'Nawanshahr', localities: ['Shaheed Bhagat Singh Nagar town', 'Balachaur Road'] }] },
      { name: 'Pathankot', cities: [{ name: 'Pathankot', localities: ['Pathankot City', 'Dalhousie Road', 'Gurdaspur Road'] }, { name: 'Gurdaspur', localities: ['Gurdaspur City', 'Dera Baba Nanak Road'] }] },
      { name: 'Khanna', cities: [{ name: 'Khanna', localities: ['Khanna City', 'Sirhind Road', 'Samrala Road'] }] },
      { name: 'Sangrur', cities: [{ name: 'Sangrur', localities: ['Sangrur City', 'Moonak Road', 'Lehra Gaga'] }] },
    ],
  },
  {
    state: 'Haryana',
    districts: [
      { name: 'Gurugram', cities: [{ name: 'Gurugram', localities: ['Cyber Hub', 'Golf Course Road', 'Sohna Road', 'Dwarka Expressway', 'Sector 29', 'Sector 82', 'Manesar', 'New Gurgaon'] }, { name: 'Manesar', localities: ['Industrial Model Township', 'Bawal Road', 'Madanpur'] }] },
      { name: 'Faridabad', cities: [{ name: 'Faridabad', localities: ['Sector 15', 'NIT', 'Ballabhgarh', 'Badkhal', 'Surajkund', 'Neelam Chowk'] }] },
      { name: 'Sonipat', cities: [{ name: 'Sonipat', localities: ['Murthal', 'Kundli', 'Sector 15', 'Samalkha'] }] },
      { name: 'Panipat', cities: [{ name: 'Panipat', localities: ['Sector 18', 'Industrial Area', 'Samalkha Road'] }] },
      { name: 'Rohtak', cities: [{ name: 'Rohtak', localities: ['Madhuban Chowk', 'Bhiwani Road', 'Meham Road'] }, { name: 'Jhajjar', localities: ['Jhajjar Town', 'Bahadurgarh Road'] }, { name: 'Bahadurgarh', localities: ['Patel Nagar', 'Sector 9', 'Delhi Road'] }] },
      { name: 'Ambala', cities: [{ name: 'Ambala', localities: ['Ambala Cantt', 'Civil Lines', 'Sadar Bazar', 'Mullana'] }, { name: 'Kurukshetra', localities: ['Thanesar', 'Sector 17', 'Pipli Road'] }, { name: 'Karnal', localities: ['Model Town', 'Sector 6', 'Indri Road'] }, { name: 'Yamunanagar', localities: ['Jagadhri', 'Yamuna Nagar City'] }, { name: 'Kaithal', localities: ['Kaithal City', 'Pundri Road'] }, { name: 'Hisar', localities: ['Hisar City', 'Urban Estate', 'Delhi Road'] }, { name: 'Rewari', localities: ['Rewari City', 'Jhajjar Road', 'Bawal Road'] }] },
    ],
  },
  {
    state: 'Uttarakhand',
    districts: [
      { name: 'Dehradun', cities: [{ name: 'Dehradun', localities: ['Rajpur Road', 'Jakhan', 'Sahastradhara Road', 'Clement Town', 'Vikasnagar', 'Mussoorie Road'] }, { name: 'Rishikesh', localities: ['Tapovan', 'Laxman Jhula', 'Ram Jhula', 'Muni ki Reti'] }, { name: 'Haridwar', localities: ['Kankhal', 'Roorkee', 'Haridwar City'] }] },
      { name: 'Haridwar', cities: [{ name: 'Haridwar', localities: ['Har Ki Pauri', 'Bhimgoda', 'Roorkee Road', 'Kankhal', 'Jwalapur'] }, { name: 'Roorkee', localities: ['Roorkee Town', 'Civil Lines', 'Shivaji Colony'] }] },
      { name: 'Nainital', cities: [{ name: 'Nainital', localities: ['Mall Road', 'Tallital', 'Bhowali', 'Haldwani', 'Bhimtal'] }, { name: 'Haldwani', localities: ['Haldwani Town', 'Munsiyari Road', 'Kathgodam'] }, { name: 'Rudrapur', localities: ['Rudrapur City', 'Pantnagar', 'Kashipur Road'] }, { name: 'Kashipur', localities: ['Kashipur Town', 'Bazpur Road', 'Jaspur'] }, { name: 'Pantnagar', localities: ['Pantnagar Campus', 'Nainital Road'] }] },
    ],
  },
]

export function slugifyLocation(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const CITY_DISTRICTS = {
  Nalagarh: 'Solan',
  Baddi: 'Solan',
  Solan: 'Solan',
  Shimla: 'Shimla',
  Kasauli: 'Solan',
  Parwanoo: 'Solan',
  Dharamshala: 'Kangra',
  Kangra: 'Kangra',
  Palampur: 'Kangra',
  Manali: 'Kullu',
  Kullu: 'Kullu',
  Mandi: 'Mandi',
  Hamirpur: 'Hamirpur',
  Bilaspur: 'Bilaspur',
  Una: 'Una',
  Chamba: 'Chamba',
  Nahan: 'Sirmaur',
  Narkanda: 'Shimla',
}

const CITY_TEHSILS = {
  Nalagarh: 'Nalagarh',
  Baddi: 'Nalagarh',
  Kasauli: 'Kasauli',
  Dharamshala: 'Dharamshala',
  Palampur: 'Palampur',
  Manali: 'Manali',
  Nahan: 'Nahan',
}

function createLocation({ id, name, type, state, district, tehsil, parentLocationId, legacyOrder, isLegacy }) {
  return {
    id,
    name,
    type,
    state,
    district,
    tehsil,
    parentLocationId,
    slug: slugifyLocation(name),
    legacyOrder,
    isLegacy,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

export function createLegacyLocationCatalog() {
  const records = []

  const addRecord = (record) => {
    records.push(record)
    return record
  }

  const state = addRecord(createLocation({
    id: 'legacy-state-himachal-pradesh',
    name: 'Himachal Pradesh',
    type: 'state',
    state: 'Himachal Pradesh',
    district: '',
    tehsil: '',
    parentLocationId: null,
    legacyOrder: -1,
    isLegacy: false,
  }))

  const districts = new Map(HIMACHAL_DISTRICTS.map((name, index) => {
    const legacyOrder = LEGACY_LOCATION_NAMES.indexOf(name)
    const id = `legacy-district-${slugifyLocation(name)}`
    return [name, addRecord(createLocation({
      id,
      name,
      type: 'district',
      state: state.name,
      district: name,
      tehsil: '',
      parentLocationId: state.id,
      legacyOrder: legacyOrder === -1 ? 100 + index : legacyOrder,
      isLegacy: legacyOrder >= 0,
    }))]
  }))

  const tehsilNames = new Set(Object.values(CITY_TEHSILS))
  const tehsils = new Map()
  for (const name of tehsilNames) {
    const district = Object.entries(CITY_TEHSILS).find(([, tehsil]) => tehsil === name)?.[0]
    const districtName = CITY_DISTRICTS[district]
    const districtLocation = districts.get(districtName)
    const id = `legacy-tehsil-${slugifyLocation(name)}`
    tehsils.set(name, addRecord(createLocation({
      id,
      name,
      type: 'tehsil',
      state: state.name,
      district: districtName,
      tehsil: name,
      parentLocationId: districtLocation.id,
      legacyOrder: 500 + tehsils.size,
      isLegacy: false,
    })))
  }

  LEGACY_LOCATION_NAMES.forEach((name, legacyOrder) => {
    const districtName = CITY_DISTRICTS[name]
    if (!districtName) return
    const tehsilName = CITY_TEHSILS[name]
    const parent = tehsilName ? tehsils.get(tehsilName) : districts.get(districtName)
    addRecord(createLocation({
      id: `legacy-city-${slugifyLocation(name)}`,
      name,
      type: 'city',
      state: state.name,
      district: districtName,
      tehsil: tehsilName || '',
      parentLocationId: parent.id,
      legacyOrder,
      isLegacy: true,
    }))
  })

  ADDITIONAL_NORTH_INDIAN_STATES.forEach(({ id, name }, index) => {
    addRecord(createLocation({
      id,
      name,
      type: 'state',
      state: name,
      district: '',
      tehsil: '',
      parentLocationId: null,
      legacyOrder: 2000 + index,
      isLegacy: false,
    }))
  })

  const northIndianRegions = [
    {
      name: 'Chandigarh',
      districts: [
        { name: 'Chandigarh', cities: [{ name: 'Chandigarh', localities: ['Sectors 1-63', 'Manimajra', 'Industrial Area Phase 1', 'Industrial Area Phase 2', 'IT Park'] }, { name: 'Manimajra', localities: ['Manimajra Market', 'Railway Colony', 'Vikas Nagar'] }, { name: 'IT Park', localities: ['Rajiv Gandhi Chandigarh Technology Park', 'Elante sector'] }] },
        { name: 'Mohali', cities: [{ name: 'Mohali', localities: ['Phase 1', 'Phase 2', 'Phase 5', 'Phase 8', 'Phase 11', 'Aerocity', 'IT City', 'Sectors 66-127', 'Mullanpur'] }, { name: 'Kharar', localities: ['Kharar Market', 'Mullanpur Road'] }, { name: 'Kurali', localities: ['Kurali Market', 'Sohana Road'] }] },
        { name: 'Panchkula', cities: [{ name: 'Panchkula', localities: ['Sectors 1-32', 'MDC', 'Sector 20', 'Kalka Highway'] }, { name: 'Pinjore', localities: ['Pinjore Gardens', 'Mughal Gardens'] }, { name: 'Kalka', localities: ['Kalka Market', 'Parwanoo Road'] }] },
        { name: 'Zirakpur', cities: [{ name: 'Zirakpur', localities: ['VIP Road', 'Dhakoli', 'Baltana', 'Pratap Nagar'] }, { name: 'Dera Bassi', localities: ['Dera Bassi Town', 'Bhabat'] }, { name: 'Lalru', localities: ['Lalru Industrial Area', 'Gharuan'] }] },
      ],
    },
    {
      name: 'Punjab',
      districts: [
        { name: 'Ludhiana', cities: [{ name: 'Ludhiana', localities: ['Civil Lines', 'Model Town', 'Ferozepur Road', 'Pakhowal Road', 'Sarabha Nagar'] }] },
        { name: 'Amritsar', cities: [{ name: 'Amritsar', localities: ['Hall Bazaar', 'Ranjit Avenue', 'Airport Road', 'Batala Road'] }] },
        { name: 'Jalandhar', cities: [{ name: 'Jalandhar', localities: ['Model Town', 'Madhopuri', 'Lajpat Nagar', 'Nakodar Road'] }, { name: 'Phagwara', localities: ['Phagwara Town', 'Sultanpur Lodhi Road'] }, { name: 'Kapurthala', localities: ['Kapurthala City', 'Bholath Road'] }] },
        { name: 'Patiala', cities: [{ name: 'Patiala', localities: ['Urban Estate', 'Rajindra Nagar', 'Tripuri', 'Model Town'] }, { name: 'Rajpura', localities: ['Rajpura Town', 'Bassi Pathana Road'] }] },
        { name: 'Bathinda', cities: [{ name: 'Bathinda', localities: ['Model Town', 'Rampura Phul Road', 'Bhucho Road'] }, { name: 'Moga', localities: ['Moga City', 'Badhni Kalan Road'] }, { name: 'Batala', localities: ['Batala Market', 'Qadian Road'] }] },
        { name: 'Rupnagar', cities: [{ name: 'Rupnagar', localities: ['Ropar Town', 'Nangal', 'Kiratpur Sahib'] }, { name: 'Mohali', localities: ['Phase 1', 'IT City', 'Aerocity'] }] },
        { name: 'Hoshiarpur', cities: [{ name: 'Hoshiarpur', localities: ['Hoshiarpur City', 'Tanda Road'] }, { name: 'Nawanshahr', localities: ['Shaheed Bhagat Singh Nagar', 'Balachaur Road'] }] },
        { name: 'Pathankot', cities: [{ name: 'Pathankot', localities: ['Pathankot City', 'Dalhousie Road'] }, { name: 'Gurdaspur', localities: ['Gurdaspur City', 'Dera Baba Nanak Road'] }] },
        { name: 'Khanna', cities: [{ name: 'Khanna', localities: ['Khanna City', 'Samrala Road', 'Sirhind Road'] }] },
      ],
    },
    {
      name: 'Haryana',
      districts: [
        { name: 'Gurugram', cities: [{ name: 'Gurugram', localities: ['Cyber Hub', 'Golf Course Road', 'Sohna Road', 'Dwarka Expressway', 'Sector 29', 'Manesar'] }, { name: 'Manesar', localities: ['IMT Manesar', 'Bawal Road'] }] },
        { name: 'Faridabad', cities: [{ name: 'Faridabad', localities: ['Sector 15', 'NIT', 'Ballabhgarh', 'Badkhal', 'Surajkund'] }] },
        { name: 'Sonipat', cities: [{ name: 'Sonipat', localities: ['Murthal', 'Kundli', 'Samalkha'] }] },
        { name: 'Panipat', cities: [{ name: 'Panipat', localities: ['Sector 18', 'Industrial Area', 'Samalkha Road'] }] },
        { name: 'Rohtak', cities: [{ name: 'Rohtak', localities: ['Madhuban Chowk', 'Meham Road', 'Bhiwani Road'] }, { name: 'Bahadurgarh', localities: ['Patel Nagar', 'Sector 9', 'Delhi Road'] }, { name: 'Jhajjar', localities: ['Jhajjar Town', 'Bahadurgarh Road'] }] },
        { name: 'Ambala', cities: [{ name: 'Ambala', localities: ['Ambala Cantt', 'Civil Lines', 'Sadar Bazar'] }, { name: 'Kurukshetra', localities: ['Thanesar', 'Pipli Road'] }, { name: 'Karnal', localities: ['Model Town', 'Sector 6', 'Indri Road'] }, { name: 'Yamunanagar', localities: ['Jagadhri', 'Yamuna Nagar City'] }, { name: 'Kaithal', localities: ['Kaithal City', 'Pundri Road'] }, { name: 'Hisar', localities: ['Hisar City', 'Urban Estate'] }, { name: 'Rewari', localities: ['Rewari City', 'Bawal Road'] }] },
      ],
    },
    {
      name: 'Uttarakhand',
      districts: [
        { name: 'Dehradun', cities: [{ name: 'Dehradun', localities: ['Rajpur Road', 'Jakhan', 'Sahastradhara Road', 'Clement Town'] }, { name: 'Rishikesh', localities: ['Tapovan', 'Laxman Jhula', 'Ram Jhula'] }, { name: 'Haridwar', localities: ['Kankhal', 'Haridwar City', 'Jwalapur'] }] },
        { name: 'Haridwar', cities: [{ name: 'Haridwar', localities: ['Har Ki Pauri', 'Bhimgoda', 'Roorkee Road', 'Kankhal'] }, { name: 'Roorkee', localities: ['Roorkee Town', 'Civil Lines', 'Shivaji Colony'] }] },
        { name: 'Nainital', cities: [{ name: 'Nainital', localities: ['Mall Road', 'Tallital', 'Bhowali'] }, { name: 'Haldwani', localities: ['Haldwani Town', 'Kathgodam'] }, { name: 'Rudrapur', localities: ['Rudrapur City', 'Pantnagar'] }, { name: 'Kashipur', localities: ['Kashipur Town', 'Jaspur'] }, { name: 'Pantnagar', localities: ['Pantnagar Campus', 'Nainital Road'] }] },
      ],
    },
  ]

  northIndianRegions.forEach((entry, stateIndex) => {
    const stateLocation = addRecord(createLocation({
      id: `legacy-state-${slugifyLocation(entry.name)}`,
      name: entry.name,
      type: 'state',
      state: entry.name,
      district: '',
      tehsil: '',
      parentLocationId: null,
      legacyOrder: 3000 + stateIndex,
      isLegacy: false,
    }))

    entry.districts.forEach((districtEntry, districtIndex) => {
      const districtLocation = addRecord(createLocation({
        id: `legacy-district-${slugifyLocation(`${entry.name}-${districtEntry.name}`)}`,
        name: districtEntry.name,
        type: 'district',
        state: stateLocation.name,
        district: districtEntry.name,
        tehsil: '',
        parentLocationId: stateLocation.id,
        legacyOrder: 4000 + (stateIndex * 100) + districtIndex,
        isLegacy: false,
      }))

      districtEntry.cities.forEach((cityEntry, cityIndex) => {
        const cityLocation = addRecord(createLocation({
          id: `legacy-city-${slugifyLocation(`${entry.name}-${districtEntry.name}-${cityEntry.name}`)}`,
          name: cityEntry.name,
          type: 'city',
          state: stateLocation.name,
          district: districtLocation.name,
          tehsil: '',
          parentLocationId: districtLocation.id,
          legacyOrder: 5000 + (stateIndex * 1000) + (districtIndex * 100) + cityIndex,
          isLegacy: false,
        }))

        cityEntry.localities.forEach((localityName, localityIndex) => {
          addRecord(createLocation({
            id: `legacy-village-${slugifyLocation(`${entry.name}-${districtEntry.name}-${cityEntry.name}-${localityName}`)}`,
            name: localityName,
            type: 'village',
            state: stateLocation.name,
            district: districtLocation.name,
            tehsil: '',
            city: cityLocation.name,
            parentLocationId: cityLocation.id,
            legacyOrder: 6000 + (stateIndex * 10000) + (districtIndex * 1000) + (cityIndex * 100) + localityIndex,
            isLegacy: false,
          }))
        })
      })
    })
  })

  return records
}
