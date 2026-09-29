import prisma from '../utils/prisma';

interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const mockSendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
  }
};

export const sendNotification = async (params: SendNotificationParams): Promise<void> => {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    },
  });
  try {
    const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { email: true } });
    if (user) await mockSendEmail(user.email, params.title, params.message);
  } catch {}
};

export const sendBulkNotifications = async (
  userIds: string[], type: string, title: string, message: string
): Promise<void> => {
  await prisma.notification.createMany({
    data: userIds.map(userId => ({ userId, type, title, message })),
  });
};
