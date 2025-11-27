import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, createReportDto: CreateReportDto) {
    const { reportedUserId, reportedPostId, reportedReviewId, reason, description } =
      createReportDto;

    // Must report at least one thing
    if (!reportedUserId && !reportedPostId && !reportedReviewId) {
      throw new BadRequestException('Must provide at least one item to report');
    }

    // Validate reported items exist
    if (reportedUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: reportedUserId } });
      if (!user) {
        throw new NotFoundException('Reported user not found');
      }
    }

    if (reportedPostId) {
      const post = await this.prisma.post.findUnique({ where: { id: reportedPostId } });
      if (!post) {
        throw new NotFoundException('Reported post not found');
      }
    }

    if (reportedReviewId) {
      const review = await this.prisma.review.findUnique({ where: { id: reportedReviewId } });
      if (!review) {
        throw new NotFoundException('Reported review not found');
      }
    }

    return this.prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        reportedPostId,
        reportedReviewId,
        reason,
        description,
        status: ReportStatus.PENDING,
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedPost: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedReview: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findMyReports(userId: string) {
    return this.prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        reportedUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reportedPost: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedReview: {
          select: {
            id: true,
            title: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reportedPost: {
          include: {
            girl: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        reportedReview: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            girl: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        resolvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}

