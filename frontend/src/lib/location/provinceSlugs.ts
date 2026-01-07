// Mapping 63 tỉnh/thành -> slug chuẩn SEO
const PROVINCE_TO_SLUG: Record<string, string> = {
  'Sài Gòn': 'sai-gon',
  'Hà Nội': 'ha-noi',
  'Đà Nẵng': 'da-nang',
  'Hải Phòng': 'hai-phong',
  'Cần Thơ': 'can-tho',
  'Bà Rịa - Vũng Tàu': 'ba-ria-vung-tau',
  'Bà Rịa Vũng Tàu': 'ba-ria-vung-tau',
  'An Giang': 'an-giang',
  'Bạc Liêu': 'bac-lieu',
  'Bắc Kạn': 'bac-kan',
  'Bắc Giang': 'bac-giang',
  'Bắc Ninh': 'bac-ninh',
  'Bến Tre': 'ben-tre',
  'Bình Dương': 'binh-duong',
  'Bình Định': 'binh-dinh',
  'Bình Phước': 'binh-phuoc',
  'Bình Thuận': 'binh-thuan',
  'Cà Mau': 'ca-mau',
  'Cao Bằng': 'cao-bang',
  'Đắk Lắk': 'dak-lak',
  'Đắk Nông': 'dak-nong',
  'Điện Biên': 'dien-bien',
  'Đồng Nai': 'dong-nai',
  'Đồng Tháp': 'dong-thap',
  'Gia Lai': 'gia-lai',
  'Hà Giang': 'ha-giang',
  'Hà Nam': 'ha-nam',
  'Hà Tĩnh': 'ha-tinh',
  'Hậu Giang': 'hau-giang',
  'Hòa Bình': 'hoa-binh',
  'Hưng Yên': 'hung-yen',
  'Khánh Hòa': 'khanh-hoa',
  'Kiên Giang': 'kien-giang',
  'Kon Tum': 'kon-tum',
  'Lai Châu': 'lai-chau',
  'Lạng Sơn': 'lang-son',
  'Lào Cai': 'lao-cai',
  'Lâm Đồng': 'lam-dong',
  'Long An': 'long-an',
  'Nam Định': 'nam-dinh',
  'Nghệ An': 'nghe-an',
  'Ninh Bình': 'ninh-binh',
  'Ninh Thuận': 'ninh-thuan',
  'Phú Thọ': 'phu-tho',
  'Phú Yên': 'phu-yen',
  'Quảng Bình': 'quang-binh',
  'Quảng Nam': 'quang-nam',
  'Quảng Ngãi': 'quang-ngai',
  'Quảng Ninh': 'quang-ninh',
  'Quảng Trị': 'quang-tri',
  'Sóc Trăng': 'soc-trang',
  'Sơn La': 'son-la',
  'Tây Ninh': 'tay-ninh',
  'Thái Bình': 'thai-binh',
  'Thái Nguyên': 'thai-nguyen',
  'Thanh Hóa': 'thanh-hoa',
  'Thừa Thiên Huế': 'thua-thien-hue',
  'Tiền Giang': 'tien-giang',
  'Trà Vinh': 'tra-vinh',
  'Tuyên Quang': 'tuyen-quang',
  'Vĩnh Long': 'vinh-long',
  'Vĩnh Phúc': 'vinh-phuc',
  'Yên Bái': 'yen-bai',
};

// Aliases phổ biến -> tên chuẩn
const SLUG_ALIASES: Record<string, string> = {
  'sai-gon': 'Sài Gòn',
  'sg': 'Sài Gòn',
  'hcm': 'Sài Gòn',
  'tphcm': 'Sài Gòn',
  'tp-hcm': 'Sài Gòn',
  'tp-ho-chi-minh': 'Sài Gòn',
  'ho-chi-minh': 'Sài Gòn',
  'ho-chi-minh-city': 'Sài Gòn',
  'ha-noi': 'Hà Nội',
  'hanoi': 'Hà Nội',
  'hn': 'Hà Nội',
  'da-nang': 'Đà Nẵng',
  'danang': 'Đà Nẵng',
  'dn': 'Đà Nẵng',
  'can-tho': 'Cần Thơ',
  'cantho': 'Cần Thơ',
  'ct': 'Cần Thơ',
  'ba-ria': 'Bà Rịa - Vũng Tàu',
  'vung-tau': 'Bà Rịa - Vũng Tàu',
};

export const PROVINCE_LIST = Object.keys(PROVINCE_TO_SLUG);

export function provinceToSlug(province: string): string | null {
  const normalized = province?.trim();
  if (!normalized) return null;
  if (PROVINCE_TO_SLUG[normalized]) return PROVINCE_TO_SLUG[normalized];

  // Fallback slugify
  const fallback = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return fallback || null;
}

export function slugToProvince(slug: string): string | null {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();

  if (SLUG_ALIASES[normalized]) {
    const province = SLUG_ALIASES[normalized];
    // For "Bà Rịa - Vũng Tàu", prefer "Bà Rịa Vũng Tàu" (without dash) if it exists in mapping
    // This matches the database format better
    if (province === 'Bà Rịa - Vũng Tàu' && PROVINCE_TO_SLUG['Bà Rịa Vũng Tàu']) {
      return 'Bà Rịa Vũng Tàu';
    }
    return province;
  }

  const directMatch = Object.entries(PROVINCE_TO_SLUG).find(
    ([, value]) => value.toLowerCase() === normalized
  );
  if (directMatch) {
    const province = directMatch[0];
    // Prefer version without dash for "Bà Rịa Vũng Tàu"
    if (province === 'Bà Rịa - Vũng Tàu' && PROVINCE_TO_SLUG['Bà Rịa Vũng Tàu']) {
      return 'Bà Rịa Vũng Tàu';
    }
    return province;
  }

  return null;
}


