import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, VerificationStatus, PostStatus, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';
import { UpdateGirlDto } from './dto/update-girl.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class GirlsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) { }

  async searchByPhone(query: string, page = 1, limit = 20) {
    if (!query || !query.trim()) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const normalizedSearch = query.trim();
    const digits = normalizedSearch.replace(/\D/g, '');

    const where: Prisma.GirlWhereInput = {
      isActive: true,
      OR: [
        { phone: { contains: normalizedSearch } },
        ...(digits ? [{ phone: { contains: digits } }] : []),
        {
          user: {
            is: {
              fullName: { contains: normalizedSearch },
            },
          },
        },
        {
          user: {
            is: {
              phone: { contains: normalizedSearch },
            },
          },
        },
        ...(digits
          ? [
            {
              user: {
                is: {
                  phone: { contains: digits },
                },
              },
            },
          ]
          : []),
        { name: { contains: normalizedSearch } },
        { bio: { contains: normalizedSearch } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.girl.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
            },
          },
          _count: {
            select: {
              posts: { where: { status: 'APPROVED' } },
              reviews: { where: { status: 'APPROVED' } },
              bookings: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { ratingAverage: 'desc' }],
      }),
      this.prisma.girl.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchByName(query: string, page = 1, limit = 20) {
    if (!query || !query.trim()) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const normalizedSearch = query.trim();

    const where: Prisma.GirlWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: normalizedSearch } },
        { bio: { contains: normalizedSearch } },
        { province: { contains: normalizedSearch } },
        { location: { contains: normalizedSearch } },
        {
          user: {
            is: {
              fullName: { contains: normalizedSearch },
            },
          },
        },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.girl.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
            },
          },
          _count: {
            select: {
              posts: { where: { status: 'APPROVED' } },
              reviews: { where: { status: 'APPROVED' } },
              bookings: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { ratingAverage: 'desc' }],
      }),
      this.prisma.girl.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(filters?: {
    districts?: string[];
    rating?: number;
    verification?: VerificationStatus;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
    priceFilter?: string;
    ageFilter?: string;
    heightFilter?: string;
    weightFilter?: string;
    originFilter?: string;
    locationFilter?: string;
    province?: string;
    search?: string;
    tags?: string[]; // Array of tags to filter by
  }) {
    const {
      districts,
      rating,
      verification,
      isFeatured,
      isPremium,
      page = 1,
      limit = 20,
      priceFilter,
      ageFilter,
      heightFilter,
      weightFilter,
      originFilter,
      locationFilter,
      province,
      search,
      tags,
    } = filters || {};

    // Get current list version for cache invalidation
    const versionKey = 'girls:list:version';
    const version = (await this.cacheService.get<number>(versionKey)) || 0;

    // Generate cache key based on all filter parameters and version
    const cacheKey = this.cacheService.generateKey(
      'girls:list',
      version,
      page,
      limit,
      districts?.join(',') || '',
      rating || 0,
      verification || '',
      isFeatured ? 'true' : isFeatured === false ? 'false' : '',
      isPremium ? 'true' : isPremium === false ? 'false' : '',
      priceFilter || '',
      ageFilter || '',
      heightFilter || '',
      weightFilter || '',
      originFilter || '',
      locationFilter || '',
      province || '',
      search || '',
      tags?.join(',') || '',
    );

    // Try to get from cache first
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      console.log('[GirlsService] Cache hit for:', cacheKey);
      return cachedData;
    }

    console.log('[GirlsService] Cache miss, fetching from database...');

    const where: Prisma.GirlWhereInput = {
      isActive: true, // Girl is independent, no need to check user
    };

    if (districts && districts.length > 0) {
      // For JSON array fields in Prisma, use array_contains or query separately
      // MySQL doesn't support hasSome for JSON, so we'll filter in application layer
      // For now, we'll skip district filtering at DB level
    }

    if (typeof rating === 'number') {
      where.ratingAverage = {
        gte: rating,
      };
    }

    if (verification) {
      where.verificationStatus = verification;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    if (search && search.trim()) {
      const normalizedSearch = search.trim();
      const digits = normalizedSearch.replace(/\D/g, '');
      const searchCondition: Prisma.GirlWhereInput = {
        OR: [
          // phone in girl record
          { phone: { contains: normalizedSearch } },
          ...(digits ? [{ phone: { contains: digits } }] : []),

          // basic text fields (case-insensitivity depends on DB collation)
          { name: { contains: normalizedSearch } },
          { bio: { contains: normalizedSearch } },
          { province: { contains: normalizedSearch } },
          { location: { contains: normalizedSearch } },

          // user fields
          {
            user: {
              is: {
                fullName: { contains: normalizedSearch },
              },
            },
          },
          {
            user: {
              is: {
                phone: { contains: normalizedSearch },
              },
            },
          },
          ...(digits
            ? [
              {
                user: {
                  is: {
                    phone: { contains: digits },
                  },
                },
              },
            ]
            : []),
        ],
      };

      where.AND = where.AND
        ? Array.isArray(where.AND)
          ? [...where.AND, searchCondition]
          : [where.AND, searchCondition]
        : [searchCondition];
    }

    // Price filter
    if (priceFilter) {
      const priceConditions: Prisma.GirlWhereInput[] = [];
      switch (priceFilter) {
        case 'under-600k':
          priceConditions.push({
            OR: [
              { price: { contains: '200' } },
              { price: { contains: '300' } },
              { price: { contains: '400' } },
              { price: { contains: '500' } },
            ],
          });
          break;
        case '600k-1000k':
          priceConditions.push({
            OR: [
              { price: { contains: '600' } },
              { price: { contains: '700' } },
              { price: { contains: '800' } },
              { price: { contains: '900' } },
              { price: { contains: '1000' } },
            ],
          });
          break;
        case 'over-1000k':
          priceConditions.push({
            AND: [
              { price: { not: null } },
              {
                NOT: {
                  OR: [
                    { price: { contains: '200' } },
                    { price: { contains: '300' } },
                    { price: { contains: '400' } },
                    { price: { contains: '500' } },
                    { price: { contains: '600' } },
                    { price: { contains: '700' } },
                    { price: { contains: '800' } },
                    { price: { contains: '900' } },
                    { price: { contains: '1000' } },
                  ],
                },
              },
            ],
          });
          break;
      }
      if (priceConditions.length > 0) {
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, ...priceConditions]
            : [where.AND, ...priceConditions]
          : priceConditions;
      }
    }

    // Age filter
    if (ageFilter) {
      const currentYear = new Date().getFullYear();
      const ageConditions: Prisma.GirlWhereInput[] = [];
      switch (ageFilter) {
        case '18-22':
          ageConditions.push({
            birthYear: {
              gte: currentYear - 22,
              lte: currentYear - 18,
            },
          });
          break;
        case '23-27':
          ageConditions.push({
            birthYear: {
              gte: currentYear - 27,
              lte: currentYear - 23,
            },
          });
          break;
        case '28-32':
          ageConditions.push({
            birthYear: {
              gte: currentYear - 32,
              lte: currentYear - 28,
            },
          });
          break;
        case 'over-32':
          ageConditions.push({
            birthYear: {
              lt: currentYear - 32,
            },
          });
          break;
      }
      if (ageConditions.length > 0) {
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, ...ageConditions]
            : [where.AND, ...ageConditions]
          : ageConditions;
      }
    }

    // Height filter
    if (heightFilter) {
      const heightConditions: Prisma.GirlWhereInput[] = [];
      switch (heightFilter) {
        case 'under-155':
          heightConditions.push({
            height: {
              contains: '150',
            },
          });
          break;
        case '155-165':
          heightConditions.push({
            OR: [
              { height: { contains: '155' } },
              { height: { contains: '160' } },
              { height: { contains: '165' } },
            ],
          });
          break;
        case '165-175':
          heightConditions.push({
            OR: [
              { height: { contains: '165' } },
              { height: { contains: '170' } },
              { height: { contains: '175' } },
            ],
          });
          break;
        case 'over-175':
          heightConditions.push({
            OR: [
              { height: { contains: '180' } },
              { height: { contains: '185' } },
              { height: { contains: '190' } },
            ],
          });
          break;
      }
      if (heightConditions.length > 0) {
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, ...heightConditions]
            : [where.AND, ...heightConditions]
          : heightConditions;
      }
    }

    // Weight filter
    if (weightFilter) {
      const weightConditions: Prisma.GirlWhereInput[] = [];
      switch (weightFilter) {
        case 'under-45':
          weightConditions.push({
            weight: {
              contains: '40',
            },
          });
          break;
        case '45-55':
          weightConditions.push({
            OR: [
              { weight: { contains: '45' } },
              { weight: { contains: '50' } },
              { weight: { contains: '55' } },
            ],
          });
          break;
        case '55-65':
          weightConditions.push({
            OR: [
              { weight: { contains: '55' } },
              { weight: { contains: '60' } },
              { weight: { contains: '65' } },
            ],
          });
          break;
        case 'over-65':
          weightConditions.push({
            OR: [
              { weight: { contains: '70' } },
              { weight: { contains: '75' } },
              { weight: { contains: '80' } },
            ],
          });
          break;
      }
      if (weightConditions.length > 0) {
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, ...weightConditions]
            : [where.AND, ...weightConditions]
          : weightConditions;
      }
    }

    // Origin filter
    if (originFilter) {
      const originConditions: Prisma.GirlWhereInput[] = [];
      switch (originFilter) {
        case 'mien-bac':
          originConditions.push({
            OR: [
              { origin: { contains: 'Bắc' } },
              { origin: { contains: 'bac' } },
              { origin: { contains: 'Bac' } },
            ],
          });
          break;
        case 'mien-trung':
          originConditions.push({
            origin: { contains: 'Trung' },
          });
          break;
        case 'mien-nam':
          originConditions.push({
            origin: { contains: 'Nam' },
          });
          break;
        case 'nuoc-ngoai':
          originConditions.push({
            AND: [
              { origin: { not: null } },
              {
                NOT: {
                  OR: [
                    { origin: { contains: 'Bắc' } },
                    { origin: { contains: 'Trung' } },
                    { origin: { contains: 'Nam' } },
                    { origin: { contains: 'Việt' } },
                    { origin: { contains: 'Viet' } },
                  ],
                },
              },
            ],
          });
          break;
      }
      if (originConditions.length > 0) {
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, ...originConditions]
            : [where.AND, ...originConditions]
          : originConditions;
      }
    }

    // Location filter (district)
    if (locationFilter) {
      const locationMap: Record<string, string> = {
        'quan-1': 'Quận 1',
        'quan-2': 'Quận 2',
        'quan-3': 'Quận 3',
        'quan-7': 'Quận 7',
        'quan-10': 'Quận 10',
      };
      const targetLocation = locationMap[locationFilter];
      if (targetLocation) {
        const locationCondition = {
          OR: [
            { location: { contains: targetLocation } },
            { province: { contains: targetLocation } },
          ],
        };
        where.AND = where.AND
          ? Array.isArray(where.AND)
            ? [...where.AND, locationCondition]
            : [where.AND, locationCondition]
          : [locationCondition];
      }
    }

    // Province filter (from LocationFilters)
    if (province) {
      const provinceCondition = {
        OR: [
          { province: { contains: province } },
          { location: { contains: province } },
        ],
      };
      where.AND = where.AND
        ? Array.isArray(where.AND)
          ? [...where.AND, provinceCondition]
          : [where.AND, provinceCondition]
        : [provinceCondition];
    }

    const select = {
      id: true,
      name: true,
      slug: true,
      age: true,
      bio: true,
      phone: true,
      birthYear: true,
      height: true,
      weight: true,
      measurements: true,
      origin: true,
      districts: true,
      address: true,
      location: true,
      province: true,
      price: true,
      ratingAverage: true,
      totalReviews: true,
      verificationStatus: true,
      viewCount: true,
      favoriteCount: true,
      isFeatured: true,
      isPremium: true,
      isActive: true,
      isAvailable: true,
      images: true,
      tags: true,
      services: true,
      lastActiveAt: true,
      workingHours: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          posts: { where: { status: PostStatus.APPROVED } },
          reviews: { where: { status: ReviewStatus.APPROVED } },
          bookings: true,
        },
      },
    };

    const orderBy: Prisma.GirlOrderByWithRelationInput[] = [
      { isFeatured: 'desc' },
      { ratingAverage: 'desc' },
      { lastActiveAt: 'desc' },
    ];

    let paginatedGirls: any[];
    let total: number;

    // If no tags filter, use DB pagination directly
    if (!tags || tags.length === 0) {
      [paginatedGirls, total] = await Promise.all([
        this.prisma.girl.findMany({
          where,
          select,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
        }),
        this.prisma.girl.count({ where }),
      ]);
    } else {
      // If tags provided, we still fetch matching records and filter in app layer
      // But we minimize the number of records by applying the rest of the 'where' in DB
      let allGirls = await this.prisma.girl.findMany({
        where,
        select,
        orderBy,
      });

      const normalizedTags = tags.map((tag) => tag.trim().toLowerCase());
      allGirls = allGirls.filter((girl) => {
        if (!girl.tags || !Array.isArray(girl.tags)) {
          return false;
        }
        const girlTags = (girl.tags as string[]).map((tag) =>
          typeof tag === 'string' ? tag.trim().toLowerCase() : '',
        );
        return normalizedTags.some((filterTag) =>
          girlTags.some(
            (girlTag) => girlTag === filterTag || girlTag.includes(filterTag),
          ),
        );
      });

      total = allGirls.length;
      paginatedGirls = allGirls.slice((page - 1) * limit, page * limit);
    }

    const result = {
      data: paginatedGirls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 5 minutes (300 seconds)
    // Cache longer for first page, shorter for filtered results
    const ttl =
      page === 1 && !province && !priceFilter && !ageFilter ? 600 : 300;
    await this.cacheService.set(cacheKey, result, ttl);

    return result;
  }

  async findOne(idOrSlug: string, incrementView: boolean = true) {
    // Try to find by ID first, then by slug
    console.log(`[GirlsService] Finding girl with idOrSlug: ${idOrSlug}`);

    // Generate cache key
    const cacheKey = this.cacheService.generateKey('girls:detail', idOrSlug);

    // Try to get from cache first
    const cachedGirl = await this.cacheService.get<any>(cacheKey);
    if (cachedGirl) {
      console.log('[GirlsService] Cache hit for girl:', idOrSlug);
      // Still increment view count even if cached
      if (incrementView && cachedGirl?.id) {
        await this.incrementViewCount(cachedGirl.id);
        // Tăng viewCount trong object trả về để UI thấy ngay
        const updatedGirl = {
          ...cachedGirl,
          viewCount: (cachedGirl.viewCount || 0) + 1,
        };
        await this.cacheService.set(cacheKey, updatedGirl, 600);
        return updatedGirl;
      }
      return cachedGirl;
    }

    console.log('[GirlsService] Cache miss, fetching from database...');
    const girl = await this.prisma.girl.findFirst({
      where: {
        AND: [
          {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          },
          { isActive: true },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
        posts: {
          where: { status: PostStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          where: { status: ReviewStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackages: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
        _count: {
          select: {
            posts: { where: { status: PostStatus.APPROVED } },
            reviews: { where: { status: ReviewStatus.APPROVED } },
            bookings: true,
            favorites: true,
          },
        },
      },
    });

    if (!girl) {
      console.log(`[GirlsService] Girl not found with idOrSlug: ${idOrSlug}`);
      // Try to find without isActive check to see if girl exists but is inactive
      const inactiveGirl = await this.prisma.girl.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        select: { id: true, isActive: true },
      });
      if (inactiveGirl) {
        console.log(
          `[GirlsService] Girl exists but isActive: ${inactiveGirl.isActive}`,
        );
      }
      throw new NotFoundException('Girl not found');
    }

    console.log(
      `[GirlsService] Found girl: ${girl.id}, isActive: ${girl.isActive}`,
    );

    // Increment view count if requested
    let result: any = girl;
    if (incrementView) {
      await this.incrementViewCount(girl.id);
      // Tăng viewCount trong object trả về
      result = {
        ...girl,
        viewCount: (girl.viewCount || 0) + 1,
      };
    }

    // Cache the result for 10 minutes (600 seconds)
    await this.cacheService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Get count of girls by province
   */
  async getCountByProvince(): Promise<
    Array<{ province: string; count: number }>
  > {
    const cacheKey = this.cacheService.generateKey('girls:count:by-province');

    // Try to get from cache first
    const cachedData =
      await this.cacheService.get<Array<{ province: string; count: number }>>(
        cacheKey,
      );
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    // Get all active girls with province
    const girls = await this.prisma.girl.findMany({
      where: {
        isActive: true,
      },
      select: {
        province: true,
      },
    });

    // Count by province
    const provinceCountMap = new Map<string, number>();

    girls.forEach((girl) => {
      if (girl.province) {
        const province = girl.province.trim();
        if (province) {
          provinceCountMap.set(
            province,
            (provinceCountMap.get(province) || 0) + 1,
          );
        }
      }
    });

    // Convert to array and sort by count
    const result = Array.from(provinceCountMap.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, result, 600);

    return result;
  }

  async incrementViewCount(id: string) {
    const updated = await this.prisma.girl.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: { id: true, slug: true, viewCount: true },
    });

    // Update Detail Cache if exists to prevent "dropping" view count on refresh
    const idKey = this.cacheService.generateKey('girls:detail', updated.id);
    const cachedById = await this.cacheService.get<any>(idKey);
    if (cachedById) {
      await this.cacheService.set(
        idKey,
        { ...cachedById, viewCount: updated.viewCount },
        600,
      );
    }

    if (updated.slug) {
      const slugKey = this.cacheService.generateKey(
        'girls:detail',
        updated.slug,
      );
      const cachedBySlug = await this.cacheService.get<any>(slugKey);
      if (cachedBySlug) {
        await this.cacheService.set(
          slugKey,
          { ...cachedBySlug, viewCount: updated.viewCount },
          600,
        );
      }
    }
  }

  async create(createGirlDto: any, managedById: string) {
    const { districts, images, tags, services, name, phone, ...rest } =
      createGirlDto;

    // Validate phone uniqueness if provided
    if (phone && phone.trim()) {
      const normalizedPhone = phone.trim();
      const existingGirl = await this.prisma.girl.findFirst({
        where: { phone: normalizedPhone },
        select: { id: true, name: true },
      });

      if (existingGirl) {
        throw new BadRequestException(
          `Số điện thoại ${normalizedPhone} đã được sử dụng bởi gái "${existingGirl.name || existingGirl.id}". Vui lòng sử dụng số điện thoại khác.`,
        );
      }
    }

    // Generate slug from name
    let slug: string | undefined;
    if (name) {
      const baseSlug = generateSlug(name);
      // Check for existing slugs
      const existingGirls = await this.prisma.girl.findMany({
        where: { slug: { startsWith: baseSlug } },
        select: { slug: true },
      });
      const existingSlugs = existingGirls
        .map((g) => g.slug)
        .filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const newGirl = await this.prisma.girl.create({
      data: {
        ...rest,
        name,
        slug,
        phone: phone?.trim() || null, // Normalize phone and set to null if empty
        managedById, // Track who manages this girl
        userId: null, // Girl is independent, not linked to user
        districts: districts
          ? Array.isArray(districts)
            ? districts
            : [districts]
          : [],
        images: images ? (Array.isArray(images) ? images : [images]) : [],
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        services: services
          ? Array.isArray(services)
            ? services
            : [services]
          : [],
      },
      // include: {
      //   managedBy: {
      //     select: {
      //       id: true,
      //       fullName: true,
      //       email: true,
      //     },
      //   },
      // },
    });

    // Invalidate list cache when new girl is created
    await this.invalidateListCache();

    return newGirl;
  }

  async updateById(id: string, updateGirlDto: any, managedById: string) {
    const girl = await this.prisma.girl.findUnique({ where: { id } });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    // Check permission - only admin or manager can update
    const currentUser = await this.prisma.user.findUnique({
      where: { id: managedById },
      select: { role: true },
    });

    // @ts-ignore - managedById will exist after migration
    const girlManagedById = (girl as any).managedById;

    if (currentUser?.role !== 'ADMIN' && girlManagedById !== managedById) {
      throw new BadRequestException(
        'You do not have permission to update this girl',
      );
    }

    const { districts, images, tags, services, name, phone, ...rest } =
      updateGirlDto;

    // Validate phone uniqueness if provided and changed
    if (phone && phone.trim() && phone.trim() !== girl.phone) {
      const normalizedPhone = phone.trim();
      const existingGirl = await this.prisma.girl.findFirst({
        where: {
          phone: normalizedPhone,
          id: { not: id }, // Exclude current girl
        },
        select: { id: true, name: true },
      });

      if (existingGirl) {
        throw new BadRequestException(
          `Số điện thoại ${normalizedPhone} đã được sử dụng bởi gái "${existingGirl.name || existingGirl.id}". Vui lòng sử dụng số điện thoại khác.`,
        );
      }
    }

    // Generate slug if name changed
    let slug: string | undefined;
    if (name && name !== girl.name) {
      const baseSlug = generateSlug(name);
      const existingGirls = await this.prisma.girl.findMany({
        where: {
          slug: { startsWith: baseSlug },
          NOT: { id },
        },
        select: { slug: true },
      });
      const existingSlugs = existingGirls
        .map((g) => g.slug)
        .filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const updatedGirl = await this.prisma.girl.update({
      where: { id },
      data: {
        ...rest,
        name,
        ...(phone !== undefined && { phone: phone?.trim() || null }), // Normalize phone if provided
        ...(slug && { slug }),
        // @ts-ignore - managedById will exist after migration
        managedById:
          currentUser?.role === 'ADMIN'
            ? managedById
            : (girl as any).managedById,
        districts: districts !== undefined ? districts : undefined,
        images: images !== undefined ? images : undefined,
        tags: tags !== undefined ? tags : undefined,
        services: services !== undefined ? services : undefined,
      },
      // include: {
      //   managedBy: {
      //     select: {
      //       id: true,
      //       fullName: true,
      //       email: true,
      //     },
      //   },
      // },
    });

    // Invalidate cache for this specific girl and list cache
    await this.invalidateGirlCache(id);
    await this.invalidateListCache();

    return updatedGirl;
  }

  async findByUserId(userId: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            posts: true,
            reviews: { where: { status: 'APPROVED' } },
            bookings: true,
            favorites: true,
          },
        },
      },
    });

    if (!girl) {
      throw new NotFoundException('Girl profile not found');
    }

    return girl;
  }

  async update(userId: string, updateGirlDto: UpdateGirlDto) {
    const girl = await this.findByUserId(userId);

    const {
      districts,
      idCardBackUrl,
      idCardFrontUrl,
      selfieUrl,
      name,
      ...rest
    } = updateGirlDto as any;

    if (!idCardFrontUrl || !idCardBackUrl || !selfieUrl) {
      throw new BadRequestException(
        'Vui lòng cung cấp đầy đủ ảnh CCCD mặt trước, mặt sau và ảnh mặt mộc',
      );
    }

    // Generate slug if name changed or slug is missing
    let slug = girl.slug;
    if (name && (name !== girl.name || !girl.slug)) {
      const baseSlug = generateSlug(name);
      const existingGirls = await this.prisma.girl.findMany({
        where: {
          slug: { startsWith: baseSlug },
          NOT: { id: girl.id },
        },
        select: { slug: true },
      });
      const existingSlugs = existingGirls
        .map((g) => g.slug)
        .filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const updatedGirl = await this.prisma.girl.update({
      where: { id: girl.id },
      data: {
        ...rest,
        images: updateGirlDto.images !== undefined ? updateGirlDto.images : undefined,
        name: name || girl.name,
        ...(slug && { slug }),
        districts: districts !== undefined ? districts : undefined,
        idCardFrontUrl,
        idCardBackUrl,
        selfieUrl,
        verificationStatus: VerificationStatus.PENDING,
        needsReverify: true,
        verificationRequestedAt: new Date(),
        verificationVerifiedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Invalidate cache for this specific girl and list cache
    await this.invalidateGirlCache(girl.id);
    if (slug && slug !== girl.slug) {
      await this.invalidateGirlCache(slug);
    }
    await this.invalidateListCache();

    return updatedGirl;
  }

  async remove(id: string, managedById: string) {
    const girl = await this.prisma.girl.findUnique({ where: { id } });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    // Check permission
    const currentUser = await this.prisma.user.findUnique({
      where: { id: managedById },
      select: { role: true },
    });

    // @ts-ignore - managedById will exist after migration
    const girlManagedById = (girl as any).managedById;

    if (currentUser?.role !== 'ADMIN' && girlManagedById !== managedById) {
      throw new BadRequestException(
        'You do not have permission to delete this girl',
      );
    }

    await this.prisma.girl.delete({ where: { id } });

    // Invalidate cache for this specific girl and list cache
    await this.invalidateGirlCache(id);
    await this.invalidateListCache();
  }

  async requestVerification(
    userId: string,
    documents: string[],
    notes?: string,
  ) {
    void notes;
    const girl = await this.findByUserId(userId);

    if (girl.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Profile is already verified');
    }

    if (girl.verificationStatus === VerificationStatus.PENDING) {
      throw new BadRequestException('Verification request is already pending');
    }

    return this.prisma.girl.update({
      where: { id: girl.id },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        verificationDocuments: documents,
        verificationRequestedAt: new Date(),
      },
    });
  }

  async approveVerification(id: string, adminId: string) {
    void adminId;
    const girl = await this.prisma.girl.findUnique({
      where: { id },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    if (girl.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Already verified');
    }

    const updated = await this.prisma.girl.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        needsReverify: false,
        verificationVerifiedAt: new Date(),
      },
    });

    // TODO: Send notification
    return updated;
  }

  async rejectVerification(id: string, adminId: string, reason: string) {
    void adminId;
    void reason;
    const girl = await this.prisma.girl.findUnique({
      where: { id },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    const updated = await this.prisma.girl.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verificationDocuments: [],
        needsReverify: false,
        verificationVerifiedAt: null,
      },
    });

    // TODO: Send notification with reason
    return updated;
  }

  async getAnalytics(userId: string) {
    const girl = await this.findByUserId(userId);

    const [bookingsCount, reviewsCount, postsCount, favoritesCount, earnings] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            girlId: girl.id,
            status: 'COMPLETED',
          },
        }),
        this.prisma.review.count({
          where: {
            girlId: girl.id,
            status: 'APPROVED',
          },
        }),
        this.prisma.post.count({
          where: {
            girlId: girl.id,
            status: 'APPROVED',
          },
        }),
        this.prisma.favorite.count({
          where: {
            girlId: girl.id,
          },
        }),
        this.prisma.booking.aggregate({
          where: {
            girlId: girl.id,
            status: 'COMPLETED',
            paymentStatus: 'COMPLETED',
          },
          _sum: {
            totalPrice: true,
          },
        }),
      ]);

    // Get bookings trend (last 12 months)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const bookingsTrend = await this.prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        girlId: girl.id,
        status: 'COMPLETED',
        bookingDate: {
          gte: lastYear,
        },
      },
      _count: true,
    });

    return {
      overview: {
        viewCount: girl.viewCount,
        bookingsCount,
        reviewsCount,
        postsCount,
        favoritesCount,
        ratingAverage: girl.ratingAverage,
        totalEarnings: earnings._sum.totalPrice || 0,
      },
      bookingsTrend,
    };
  }

  async updateRating(girlId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        girlId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const ratingAverage =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return this.prisma.girl.update({
      where: { id: girlId },
      data: {
        ratingAverage,
        totalReviews,
      },
    });
  }

  async addImages(girlId: string, imageUrls: string[]) {
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      select: { images: true },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    const currentImages = Array.isArray(girl.images)
      ? (girl.images as string[])
      : [];
    const uniqueImages = Array.from(
      new Set([...currentImages, ...imageUrls.filter((url) => !!url)]),
    );

    return this.prisma.girl.update({
      where: { id: girlId },
      data: {
        images: {
          set: uniqueImages,
        },
      },
      select: {
        id: true,
        images: true,
      },
    });
  }

  async removeImage(girlId: string, imageUrl: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      select: { images: true },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    const currentImages = Array.isArray(girl.images)
      ? (girl.images as string[])
      : [];
    return this.prisma.girl.update({
      where: { id: girlId },
      data: {
        images: {
          set: currentImages.filter((url) => url !== imageUrl),
        },
      },
      select: {
        id: true,
        images: true,
      },
    });

    // Invalidate cache when images are updated
    await this.invalidateGirlCache(girlId);
  }

  // Helper methods for cache invalidation
  private async invalidateGirlCache(idOrSlug: string): Promise<void> {
    // Invalidate detail cache
    const detailKey = this.cacheService.generateKey('girls:detail', idOrSlug);
    await this.cacheService.del(detailKey);
    console.log('[GirlsService] Invalidated cache for girl:', idOrSlug);
  }

  private async invalidateListCache(): Promise<void> {
    // Invalidate all list caches by pattern
    // Since we can't easily pattern match, we'll use a simple approach:
    // Set a version number that changes when list is invalidated
    const versionKey = 'girls:list:version';
    const currentVersion =
      (await this.cacheService.get<number>(versionKey)) || 0;
    await this.cacheService.set(versionKey, currentVersion + 1, 86400); // 24 hours
    console.log(
      '[GirlsService] Invalidated list cache, new version:',
      currentVersion + 1,
    );
  }
}
