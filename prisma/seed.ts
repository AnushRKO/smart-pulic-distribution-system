import { PrismaClient, Role, RationCardType, CommodityUnit, ShopStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Smart PDS database...');

  // ── 1. Users ─────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hash(p, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartpds.local' },
    update: {},
    create: {
      email: 'admin@smartpds.local',
      passwordHash: await hash('Admin@1234'),
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '9876543210',
      role: Role.ADMINISTRATOR,
    },
  });

  const officialUser = await prisma.user.upsert({
    where: { email: 'official@smartpds.local' },
    update: {},
    create: {
      email: 'official@smartpds.local',
      passwordHash: await hash('Official@1234'),
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '9876543211',
      role: Role.GOVERNMENT_OFFICIAL,
    },
  });

  const distUser = await prisma.user.upsert({
    where: { email: 'distributor@smartpds.local' },
    update: {},
    create: {
      email: 'distributor@smartpds.local',
      passwordHash: await hash('Dist@1234'),
      firstName: 'Suresh',
      lastName: 'Patel',
      phone: '9876543212',
      role: Role.DISTRIBUTOR,
    },
  });

  const benUser = await prisma.user.upsert({
    where: { email: 'beneficiary@smartpds.local' },
    update: {},
    create: {
      email: 'beneficiary@smartpds.local',
      passwordHash: await hash('Ben@1234'),
      firstName: 'Anita',
      lastName: 'Devi',
      phone: '9876543213',
      role: Role.BENEFICIARY,
    },
  });

  // Extra beneficiary users
  const benUsers = [];
  const benNames = [
    ['Ramesh','Yadav'],['Kavitha','Nair'],['Mohan','Singh'],['Sunita','Gupta'],
    ['Vijay','Reddy'],['Lakshmi','Pillai'],['Arjun','Mehta'],['Pooja','Joshi'],
    ['Deepak','Tiwari'],['Meena','Patel'],
  ];
  for (let i = 0; i < benNames.length; i++) {
    const [fn, ln] = benNames[i];
    const u = await prisma.user.upsert({
      where: { email: `ben${i+2}@smartpds.local` },
      update: {},
      create: {
        email: `ben${i+2}@smartpds.local`,
        passwordHash: await hash('Ben@1234'),
        firstName: fn, lastName: ln,
        phone: `98765${43214 + i}`,
        role: Role.BENEFICIARY,
      },
    });
    benUsers.push(u);
  }

  console.log('✅ Users created');

  // ── 2. Distributor entity ─────────────────────────────────────────────
  const distributor = await prisma.distributor.upsert({
    where: { userId: distUser.id },
    update: {},
    create: { userId: distUser.id, distributorId: 'DIST-2026-001', licenseNumber: 'LIC-MH-2026-001' },
  });

  console.log('✅ Distributor created');

  // ── 3. Shops ──────────────────────────────────────────────────────────
  const shop1 = await prisma.shop.upsert({
    where: { shopId: 'SHOP-2026-001' },
    update: {},
    create: {
      shopId: 'SHOP-2026-001',
      name: 'Ganesh Ration Store',
      address: '12, Gandhi Nagar, Pune',
      area: 'Gandhi Nagar',
      district: 'Pune',
      state: 'Maharashtra',
      phone: '9800000001',
      distributorId: distributor.id,
      status: ShopStatus.ACTIVE,
    },
  });

  const shop2 = await prisma.shop.upsert({
    where: { shopId: 'SHOP-2026-002' },
    update: {},
    create: {
      shopId: 'SHOP-2026-002',
      name: 'Shiva PDS Centre',
      address: '45, Nehru Road, Pune',
      area: 'Nehru Road',
      district: 'Pune',
      state: 'Maharashtra',
      phone: '9800000002',
      distributorId: distributor.id,
      status: ShopStatus.ACTIVE,
    },
  });

  const shop3 = await prisma.shop.upsert({
    where: { shopId: 'SHOP-2026-003' },
    update: {},
    create: {
      shopId: 'SHOP-2026-003',
      name: 'Laxmi Fair Price Shop',
      address: '7, Market Road, Nashik',
      area: 'Market Road',
      district: 'Nashik',
      state: 'Maharashtra',
      phone: '9800000003',
      status: ShopStatus.ACTIVE,
    },
  });

  console.log('✅ Shops created');

  // ── 4. Commodities ────────────────────────────────────────────────────
  const rice = await prisma.commodity.upsert({
    where: { commodityCode: 'COM-RICE' },
    update: {},
    create: { commodityCode: 'COM-RICE', name: 'Rice', unit: CommodityUnit.KG, subsidizedRate: 3, marketRate: 40, description: 'Fine quality rice under NFSA' },
  });
  const wheat = await prisma.commodity.upsert({
    where: { commodityCode: 'COM-WHEAT' },
    update: {},
    create: { commodityCode: 'COM-WHEAT', name: 'Wheat', unit: CommodityUnit.KG, subsidizedRate: 2, marketRate: 32, description: 'Wheat flour grains under NFSA' },
  });
  const sugar = await prisma.commodity.upsert({
    where: { commodityCode: 'COM-SUGAR' },
    update: {},
    create: { commodityCode: 'COM-SUGAR', name: 'Sugar', unit: CommodityUnit.KG, subsidizedRate: 13.5, marketRate: 45, description: 'Subsidized sugar' },
  });
  const oil = await prisma.commodity.upsert({
    where: { commodityCode: 'COM-OIL' },
    update: {},
    create: { commodityCode: 'COM-OIL', name: 'Cooking Oil', unit: CommodityUnit.LITER, subsidizedRate: 25, marketRate: 120, description: 'Refined sunflower oil' },
  });
  const kerosene = await prisma.commodity.upsert({
    where: { commodityCode: 'COM-KERO' },
    update: {},
    create: { commodityCode: 'COM-KERO', name: 'Kerosene', unit: CommodityUnit.LITER, subsidizedRate: 15, marketRate: 78, description: 'Subsidized kerosene for BPL families' },
  });

  console.log('✅ Commodities created');

  // ── 5. Inventory ──────────────────────────────────────────────────────
  const inventoryData = [
    { shopId: shop1.id, commodityId: rice.id,     opening: 5000, received: 2000, distributed: 1500, threshold: 500 },
    { shopId: shop1.id, commodityId: wheat.id,    opening: 3000, received: 1000, distributed: 800,  threshold: 300 },
    { shopId: shop1.id, commodityId: sugar.id,    opening: 500,  received: 200,  distributed: 350,  threshold: 100 },
    { shopId: shop1.id, commodityId: oil.id,      opening: 300,  received: 100,  distributed: 280,  threshold: 50  },
    { shopId: shop1.id, commodityId: kerosene.id, opening: 1000, received: 500,  distributed: 900,  threshold: 200 },
    { shopId: shop2.id, commodityId: rice.id,     opening: 4000, received: 1500, distributed: 1200, threshold: 400 },
    { shopId: shop2.id, commodityId: wheat.id,    opening: 2500, received: 800,  distributed: 600,  threshold: 250 },
    { shopId: shop2.id, commodityId: sugar.id,    opening: 400,  received: 150,  distributed: 100,  threshold: 80  },
    { shopId: shop3.id, commodityId: rice.id,     opening: 3000, received: 1000, distributed: 800,  threshold: 300 },
    { shopId: shop3.id, commodityId: wheat.id,    opening: 2000, received: 700,  distributed: 500,  threshold: 200 },
  ];

  for (const inv of inventoryData) {
    const avail = inv.opening + inv.received - inv.distributed;
    const status = avail <= 0 ? 'OUT_OF_STOCK' : avail <= inv.threshold ? 'LOW_STOCK' : 'AVAILABLE';
    await prisma.inventory.upsert({
      where: { shopId_commodityId: { shopId: inv.shopId, commodityId: inv.commodityId } },
      update: {},
      create: {
        shopId: inv.shopId,
        commodityId: inv.commodityId,
        openingStock: inv.opening,
        receivedStock: inv.received,
        distributedStock: inv.distributed,
        availableStock: avail,
        threshold: inv.threshold,
        status: status as any,
      },
    });
  }

  console.log('✅ Inventory created');

  // ── 6. Beneficiaries + Ration Cards + Entitlements ───────────────────
  const allBenUsers = [benUser, ...benUsers];
  const cardTypes: RationCardType[] = ['BPL','BPL','AAY','APL','BPL','PHH','BPL','AAY','APL','BPL','PHH'];
  const shops = [shop1, shop2, shop3];

  const createdBeneficiaries = [];
  for (let i = 0; i < allBenUsers.length; i++) {
    const u = allBenUsers[i];
    let ben = await prisma.beneficiary.findUnique({ where: { userId: u.id } });
    if (!ben) {
      ben = await prisma.beneficiary.create({
        data: {
          userId: u.id,
          beneficiaryId: `BEN-2026-${String(i+1).padStart(5,'0')}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          address: `${(i+1)*10}, Sample Street, Pune`,
          district: i < 7 ? 'Pune' : 'Nashik',
          state: 'Maharashtra',
          pincode: `41100${i+1}`,
          dateOfBirth: new Date(1975 + i, i % 12, (i % 28) + 1),
          aadharNumber: `${2000000000 + i}`,
        },
      });
    }

    let rc = await prisma.rationCard.findUnique({ where: { beneficiaryId: ben.id } });
    if (!rc) {
      rc = await prisma.rationCard.create({
        data: {
          cardNumber: `RC-2026-${String(i+1).padStart(6,'0')}`,
          cardType: cardTypes[i],
          beneficiaryId: ben.id,
          assignedShopId: shops[i % 3].id,
          issueDate: new Date('2024-01-01'),
          expiryDate: new Date('2027-12-31'),
          status: 'ACTIVE',
        },
      });
    }

    // Family members
    const existingMembers = await prisma.familyMember.count({ where: { rationCardId: rc.id } });
    if (existingMembers === 0) {
      await prisma.familyMember.createMany({
        data: [
          { rationCardId: rc.id, name: `${u.firstName} ${u.lastName}`, relationship: 'Head', gender: i % 2 === 0 ? 'Male' : 'Female', dateOfBirth: new Date(1975 + i, 0, 1) },
          { rationCardId: rc.id, name: `Spouse of ${u.firstName}`, relationship: 'Spouse', gender: i % 2 === 0 ? 'Female' : 'Male', dateOfBirth: new Date(1978 + i, 3, 15) },
          { rationCardId: rc.id, name: `Child 1 of ${u.firstName}`, relationship: 'Son', gender: 'Male', dateOfBirth: new Date(2005 + (i%5), 6, 20) },
        ],
      });
    }

    // Entitlements (based on card type)
    const quotaMap: Record<string, Record<string, number>> = {
      AAY:  { [rice.id]: 35, [wheat.id]: 0,  [sugar.id]: 1,   [oil.id]: 1 },
      BPL:  { [rice.id]: 10, [wheat.id]: 5,  [sugar.id]: 0.5, [oil.id]: 0 },
      PHH:  { [rice.id]: 5,  [wheat.id]: 5,  [sugar.id]: 0,   [oil.id]: 0 },
      APL:  { [rice.id]: 0,  [wheat.id]: 3,  [sugar.id]: 0,   [oil.id]: 0 },
    };
    const cardTypeStr = cardTypes[i];
    const quotas = quotaMap[cardTypeStr] || quotaMap['BPL'];
    for (const [commodityId, quota] of Object.entries(quotas)) {
      if (quota > 0) {
        const existing = await prisma.entitlement.findUnique({ where: { rationCardId_commodityId: { rationCardId: rc.id, commodityId } } });
        if (!existing) {
          await prisma.entitlement.create({
            data: { rationCardId: rc.id, commodityId, monthlyQuota: quota, collectedThisMonth: 0 },
          });
        }
      }
    }

    createdBeneficiaries.push({ user: u, ben, rc });
  }

  console.log('✅ Beneficiaries, ration cards, family members & entitlements created');

  // ── 7. Sample Transactions (historical) ──────────────────────────────
  const txnCommodities = [
    { commodity: rice,  quantity: 5,  shop: shop1 },
    { commodity: wheat, quantity: 3,  shop: shop1 },
    { commodity: sugar, quantity: 0.5, shop: shop2 },
    { commodity: rice,  quantity: 10, shop: shop2 },
    { commodity: wheat, quantity: 5,  shop: shop1 },
  ];

  for (let i = 0; i < Math.min(5, createdBeneficiaries.length); i++) {
    const { ben, rc } = createdBeneficiaries[i];
    const txnData = txnCommodities[i];
    const txnExists = await prisma.transaction.count({ where: { beneficiaryId: ben.id } });
    if (txnExists === 0) {
      const dist = await prisma.distribution.create({
        data: {
          distributionId: `DIST-REC-2026-${String(i+1).padStart(6,'0')}`,
          beneficiaryId: ben.id,
          shopId: txnData.shop.id,
          commodityId: txnData.commodity.id,
          quantity: txnData.quantity,
          distributedById: distUser.id,
        },
      });
      await prisma.transaction.create({
        data: {
          transactionId: `TXN-2026-${String(i+1).padStart(6,'0')}`,
          beneficiaryId: ben.id,
          rationCardId: rc.id,
          shopId: txnData.shop.id,
          commodityId: txnData.commodity.id,
          distributionId: dist.id,
          quantity: txnData.quantity,
          unitPrice: txnData.commodity.subsidizedRate,
          totalAmount: txnData.quantity * txnData.commodity.subsidizedRate,
          status: 'COMPLETED',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    }
  }

  console.log('✅ Sample transactions created');

  // ── 8. Notifications ──────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: benUser.id, type: 'DISTRIBUTION_COMPLETED', title: 'Distribution Completed', message: 'Your Rice distribution TXN-2026-000001 has been completed successfully.', status: 'UNREAD' },
      { userId: benUser.id, type: 'STOCK_AVAILABLE',        title: 'Stock Available',         message: 'Rice is now available at Ganesh Ration Store.', status: 'READ' },
      { userId: distUser.id, type: 'LOW_STOCK',             title: 'Low Stock Alert',          message: 'Sugar stock at Ganesh Ration Store is running low. Current stock: 350 KG.', status: 'UNREAD' },
      { userId: adminUser.id, type: 'SYSTEM',               title: 'System Initialized',       message: 'Smart PDS system has been initialized with demo data.', status: 'READ' },
    ],
  });

  console.log('✅ Notifications created');

  // ── 9. Audit Logs ─────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { performedById: adminUser.id, action: 'USER_CREATED',       entity: 'User',       entityId: adminUser.id, description: 'System initialization - admin user created' },
      { performedById: adminUser.id, action: 'SHOP_CREATED',       entity: 'Shop',       entityId: shop1.id,     description: 'Shop created: Ganesh Ration Store' },
      { performedById: adminUser.id, action: 'SHOP_CREATED',       entity: 'Shop',       entityId: shop2.id,     description: 'Shop created: Shiva PDS Centre' },
      { performedById: adminUser.id, action: 'COMMODITY_CREATED',  entity: 'Commodity',  entityId: rice.id,      description: 'Commodity created: Rice' },
      { performedById: adminUser.id, action: 'STOCK_ADDED',        entity: 'Inventory',  entityId: shop1.id,     description: 'Initial stock loaded for Ganesh Ration Store' },
      { performedById: distUser.id,  action: 'DISTRIBUTION_CREATED', entity: 'Distribution', entityId: shop1.id, description: 'Distribution recorded by Suresh Patel' },
    ],
  });

  // ── 10. System Settings ───────────────────────────────────────────────
  const settings = [
    { key: 'system_name',       value: 'Smart Public Distribution System', label: 'System Name',          category: 'general' },
    { key: 'state',             value: 'Maharashtra',                       label: 'State',                category: 'general' },
    { key: 'distribution_cycle', value: 'monthly',                          label: 'Distribution Cycle',   category: 'distribution' },
    { key: 'low_stock_alert',   value: '100',                               label: 'Low Stock Threshold',  category: 'inventory' },
    { key: 'support_email',     value: 'support@smartpds.gov.in',           label: 'Support Email',        category: 'contact' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log('✅ System settings created');
  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo Accounts:');
  console.log('  Admin:       admin@smartpds.local       / Admin@1234');
  console.log('  Official:    official@smartpds.local    / Official@1234');
  console.log('  Distributor: distributor@smartpds.local / Dist@1234');
  console.log('  Beneficiary: beneficiary@smartpds.local / Ben@1234\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
