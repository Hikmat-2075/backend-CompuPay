import BaseError from "../../base_classes/base-error.js";
import { PrismaService } from "../../common/services/prisma.service.js";
import firebaseService from "../../common/services/firebase.service.js";

class NotificationService {
  constructor() {
    this.prisma = new PrismaService();
  }

  async saveDeviceToken(currentUser, data) {
    const existing = await this.prisma.userDeviceToken.findUnique({
      where: {
        token: data.token,
      },
    });

    if (existing) {
      return this.prisma.userDeviceToken.update({
        where: {
          token: data.token,
        },
        data: {
          user_id: currentUser.id,
          platform: data.platform || existing.platform,
          is_active: true,
        },
      });
    }

    return this.prisma.userDeviceToken.create({
      data: {
        user_id: currentUser.id,
        token: data.token,
        platform: data.platform || null,
        is_active: true,
      },
    });
  }

  async removeDeviceToken(currentUser, data) {
    const deviceToken = await this.prisma.userDeviceToken.findUnique({
      where: {
        token: data.token,
      },
    });

    if (!deviceToken) {
      throw BaseError.notFound("Device token not found");
    }

    if (deviceToken.user_id !== currentUser.id) {
      throw BaseError.forbidden("You are not allowed to remove this token");
    }

    return this.prisma.userDeviceToken.update({
      where: {
        token: data.token,
      },
      data: {
        is_active: false,
      },
    });
  }

  async list(currentUser, query = {}) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;

    const where = {
      user_id: currentUser.id,
    };

    const [data, count] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async markAsRead(currentUser, id) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw BaseError.notFound("Notification not found");
    }

    if (notification.user_id !== currentUser.id) {
      throw BaseError.forbidden(
        "You are not allowed to update this notification",
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        is_read: true,
      },
    });
  }

  async markAllAsRead(currentUser) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: currentUser.id,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return {
      message: "All notifications marked as read",
    };
  }

  getPayrollNotificationContent(payroll) {
    if (payroll.status === "PAID") {
      return {
        type: "PAYROLL_PAID",
        title: "Payroll Paid",
        body: `Payroll ${payroll.ref_no} has been paid.`,
      };
    }

    if (payroll.status === "CANCELED") {
      return {
        type: "PAYROLL_CANCELED",
        title: "Payroll Canceled",
        body: `Payroll ${payroll.ref_no} has been canceled.`,
      };
    }

    return null;
  }

  async createPayrollStatusNotification({ userId, payroll }) {
    const content = this.getPayrollNotificationContent(payroll);

    if (!content) {
      return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        user_id: userId,
        title: content.title,
        body: content.body,
        type: content.type,
        data: {
          payroll_id: payroll.id,
          ref_no: payroll.ref_no,
          status: payroll.status,
          net: String(payroll.net ?? ""),
          paid_at: payroll.paid_at ? payroll.paid_at.toISOString() : null,
        },
      },
    });

    const deviceTokens = await this.prisma.userDeviceToken.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    const tokens = deviceTokens.map((item) => item.token);

    try {
      await firebaseService.sendToTokens(tokens, {
        title: content.title,
        body: content.body,
        data: {
          type: content.type,
          notification_id: notification.id,
          payroll_id: payroll.id,
          ref_no: payroll.ref_no,
          status: payroll.status,
        },
      });
    } catch (err) {
      console.error("❌ Failed to send payroll notification:", err);
    }

    return notification;
  }
}

export default new NotificationService();
