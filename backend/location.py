import geocoder
import math


ALGERIA_BOUNDS = {
    "min_lat": 19.0,
    "max_lat": 37.1,
    "min_lng": -9.0,
    "max_lng": 12.0,
}

# 58 wilayas with approximate center coordinates
WILAYAS = {
    "01 - Adrar": (27.87, -0.20),
    "02 - Chlef": (36.17, 1.33),
    "03 - Laghouat": (33.80, 2.88),
    "04 - Oum El Bouaghi": (35.88, 7.12),
    "05 - Batna": (35.56, 6.17),
    "06 - Béjaïa": (36.75, 5.07),
    "07 - Biskra": (34.85, 5.73),
    "08 - Béchar": (31.62, -2.23),
    "09 - Blida": (36.47, 2.83),
    "10 - Bouira": (36.37, 3.90),
    "11 - Tamanrasset": (22.78, 5.52),
    "12 - Tébessa": (35.40, 8.12),
    "13 - Tlemcen": (34.88, -1.32),
    "14 - Tiaret": (35.37, 1.32),
    "15 - Tizi Ouzou": (36.72, 4.05),
    "16 - Alger": (36.75, 3.04),
    "17 - Djelfa": (34.67, 3.25),
    "18 - Jijel": (36.80, 5.77),
    "19 - Sétif": (36.19, 5.41),
    "20 - Saïda": (34.83, 0.15),
    "21 - Skikda": (36.88, 6.91),
    "22 - Sidi Bel Abbès": (35.19, -0.63),
    "23 - Annaba": (36.90, 7.76),
    "24 - Guelma": (36.46, 7.43),
    "25 - Constantine": (36.37, 6.61),
    "26 - Médéa": (36.27, 2.75),
    "27 - Mostaganem": (35.93, 0.09),
    "28 - M'Sila": (35.70, 4.54),
    "29 - Mascara": (35.40, 0.14),
    "30 - Ouargla": (31.95, 5.33),
    "31 - Oran": (35.70, -0.64),
    "32 - El Bayadh": (33.68, 1.02),
    "33 - Illizi": (26.50, 8.48),
    "34 - Bordj Bou Arréridj": (36.07, 4.76),
    "35 - Boumerdès": (36.77, 3.48),
    "36 - El Tarf": (36.77, 8.31),
    "37 - Tindouf": (27.67, -8.15),
    "38 - Tissemsilt": (35.60, 1.82),
    "39 - El Oued": (33.37, 6.87),
    "40 - Khenchela": (35.43, 7.14),
    "41 - Souk Ahras": (36.28, 7.95),
    "42 - Tipaza": (36.59, 2.45),
    "43 - Mila": (36.45, 6.26),
    "44 - Aïn Defla": (36.26, 1.97),
    "45 - Naâma": (33.27, -0.31),
    "46 - Aïn Témouchent": (35.30, -1.14),
    "47 - Ghardaïa": (32.49, 3.67),
    "48 - Relizane": (35.74, 0.56),
    "49 - El M'Ghair": (33.95, 5.92),
    "50 - El Meniaa": (30.58, 2.88),
    "51 - Ouled Djellal": (34.43, 5.07),
    "52 - Bordj Badji Mokhtar": (21.33, 0.95),
    "53 - Béni Abbès": (30.13, -2.17),
    "54 - Timimoun": (29.26, 0.23),
    "55 - Touggourt": (33.10, 6.06),
    "56 - Djanet": (24.55, 9.48),
    "57 - In Salah": (27.20, 2.48),
    "58 - In Guezzam": (19.57, 5.77),
}


def get_current_gps_coordinates():
    """Get approximate coordinates using IP geolocation."""
    g = geocoder.ip("me")
    if g.latlng is not None:
        return g.latlng
    return None


def resolve_wilaya(lat: float, lon: float) -> str | None:
    """Find the closest wilaya to given coordinates using centroid distance."""
    closest_wilaya = None
    min_dist = float("inf")
    for name, (w_lat, w_lon) in WILAYAS.items():
        d = get_distance(lat, lon, w_lat, w_lon)
        if d < min_dist:
            min_dist = d
            closest_wilaya = name
    return closest_wilaya


def is_in_algeria(lat: float, lon: float) -> bool:
    """Check if coordinates fall within Algeria's bounding box."""
    return (
        ALGERIA_BOUNDS["min_lat"] <= lat <= ALGERIA_BOUNDS["max_lat"]
        and ALGERIA_BOUNDS["min_lng"] <= lon <= ALGERIA_BOUNDS["max_lng"]
    )


def get_location_info(lat: float, lng: float) -> dict:
    """Get location information for coordinates."""
    if not is_in_algeria(lat, lng):
        return {"wilaya": None, "country": "Unknown", "latitude": lat, "longitude": lng}
    wilaya = resolve_wilaya(lat, lng)
    return {"wilaya": wilaya, "country": "Algeria", "latitude": lat, "longitude": lng}


def get_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two coordinates using the Haversine formula."""
    R = 6371.0
    lat1_r, lng1_r = math.radians(lat1), math.radians(lng1)
    lat2_r, lng2_r = math.radians(lat2), math.radians(lng2)
    dlat = lat2_r - lat1_r
    dlng = lng2_r - lng1_r
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)
