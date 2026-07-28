import { PrismaClient, RoleType, ListingType, ListingStatus, KycStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seller = await prisma.user.upsert({
    where: { phone: '9876500001' },
    update: {},
    create: {
      phone: '9876500001',
      email: 'raj@cropvibe.app',
      name: 'Raj Patel',
      location: 'Hyderabad, TG',
      phoneVerified: true,
      kycStatus: KycStatus.APPROVED,
      activeRole: RoleType.SELLER,
      roles: {
        create: [
          { role: RoleType.SELLER, isPrimary: true },
          { role: RoleType.BUYER },
        ],
      },
      businesses: {
        create: [
          {
            name: 'Green Valley Farms',
            type: 'Vegetables',
            address: 'Hyderabad, TG',
            bankAccounts: {
              create: [
                {
                  holderName: 'Raj Patel',
                  bankName: 'HDFC Bank',
                  accountNumber: '501001234521',
                  ifsc: 'HDFC0001234',
                  verified: true,
                },
              ],
            },
          },
        ],
      },
      wallet: { create: { availableBalance: 68420 } },
    },
  });

  const buyer = await prisma.user.upsert({
    where: { phone: '9876500002' },
    update: {},
    create: {
      phone: '9876500002',
      email: 'priya@cropvibe.app',
      name: 'Priya Mehta',
      location: 'Mumbai, MH',
      phoneVerified: true,
      kycStatus: KycStatus.APPROVED,
      activeRole: RoleType.BUYER,
      roles: { create: [{ role: RoleType.BUYER, isPrimary: true }] },
      wallet: { create: {} },
    },
  });

  await prisma.listing.upsert({
    where: { slug: 'organic-tomatoes-grade-a' },
    update: {},
    create: {
      ownerId: seller.id,
      type: ListingType.PRODUCT,
      status: ListingStatus.PUBLISHED,
      title: 'Organic Tomatoes — Grade A',
      slug: 'organic-tomatoes-grade-a',
      description:
        'Fresh Grade A organic tomatoes harvested from Nashik district farms. Ideal for retail and HORECA bulk orders with consistent sizing and shelf life of 5–7 days under ambient storage.',
      category: 'Vegetables',
      price: 45,
      unit: 'kg',
      moq: 50,
      quantity: 1200,
      reorderLevel: 100,
      location: 'Nashik, MH',
      images: [],
      publishedAt: new Date(),
      ratingAvg: 4.7,
      ratingCount: 156,
    },
  });

  await prisma.listing.upsert({
    where: { slug: 'mahindra-575-tractor-day-rental' },
    update: {},
    create: {
      ownerId: seller.id,
      type: ListingType.EQUIPMENT,
      status: ListingStatus.PUBLISHED,
      title: 'Mahindra 575 DI Tractor',
      slug: 'mahindra-575-tractor-day-rental',
      description:
        'Well-maintained 45 HP Mahindra 575 DI tractor available for daily rental with optional operator. Recently serviced, suitable for tillage and haulage within 50 km of Pune.',
      category: 'Machinery',
      price: 2500,
      unit: 'day',
      deposit: 15000,
      location: 'Pune, MH',
      serviceRadiusKm: 50,
      images: [],
      publishedAt: new Date(),
      ratingAvg: 4.8,
      ratingCount: 89,
    },
  });

  console.log('Seeded users:', { seller: seller.phone, buyer: buyer.phone });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
