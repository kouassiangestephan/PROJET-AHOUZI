import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  const passwordHash = await bcrypt.hash('Admin@2024', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ahouzi.ci' },
    update: {},
    create: {
      email: 'admin@ahouzi.ci',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'AHOUZI',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Administrateur créé:', admin.email);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@ahouzi.ci' },
    update: {},
    create: {
      email: 'manager@ahouzi.ci',
      password: await bcrypt.hash('Manager@2024', 12),
      firstName: 'Kofi',
      lastName: 'Mensah',
      role: 'GENERAL_MANAGER',
      isActive: true,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@ahouzi.ci' },
    update: {},
    create: {
      email: 'reception@ahouzi.ci',
      password: await bcrypt.hash('Reception@2024', 12),
      firstName: 'Awa',
      lastName: 'Diallo',
      role: 'RECEPTIONIST',
      isActive: true,
    },
  });
  console.log('✅ Utilisateurs créés');

  const property1 = await prisma.property.upsert({
    where: { id: 'prop-abidjan-001' },
    update: {},
    create: {
      id: 'prop-abidjan-001',
      name: 'AHOUZI Grand Hôtel Abidjan',
      type: 'HOTEL',
      address: 'Boulevard de la Corniche, Cocody',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      phone: '+225 27 22 44 00 00',
      email: 'abidjan@ahouzi.ci',
      totalRooms: 50,
      currency: 'XOF',
      timezone: 'Africa/Abidjan',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      managerId: manager.id,
    },
  });

  const property2 = await prisma.property.upsert({
    where: { id: 'prop-bouake-001' },
    update: {},
    create: {
      id: 'prop-bouake-001',
      name: 'AHOUZI Résidence Bouaké',
      type: 'FURNISHED_RESIDENCE',
      address: 'Quartier Commerce, Rue du Commerce',
      city: 'Bouaké',
      country: 'Côte d\'Ivoire',
      phone: '+225 27 31 00 00 00',
      email: 'bouake@ahouzi.ci',
      totalRooms: 20,
      currency: 'XOF',
      timezone: 'Africa/Abidjan',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      managerId: manager.id,
    },
  });
  console.log('✅ Propriétés créées');

  const roomTypes = [
    { number: '101', type: 'STANDARD', floor: 1, maxOccupancy: 2, basePrice: 45000, area: 25 },
    { number: '102', type: 'STANDARD', floor: 1, maxOccupancy: 2, basePrice: 45000, area: 25 },
    { number: '201', type: 'DELUXE', floor: 2, maxOccupancy: 2, basePrice: 75000, area: 35 },
    { number: '202', type: 'DELUXE', floor: 2, maxOccupancy: 3, basePrice: 80000, area: 40 },
    { number: '301', type: 'SUITE', floor: 3, maxOccupancy: 4, basePrice: 150000, area: 65 },
    { number: '302', type: 'JUNIOR_SUITE', floor: 3, maxOccupancy: 2, basePrice: 100000, area: 45 },
    { number: '401', type: 'PRESIDENTIAL_SUITE', floor: 4, maxOccupancy: 6, basePrice: 350000, area: 120 },
  ];

  for (const room of roomTypes) {
    await prisma.room.upsert({
      where: { propertyId_number: { propertyId: property1.id, number: room.number } },
      update: {},
      create: {
        ...room,
        propertyId: property1.id,
        status: 'AVAILABLE',
        currency: 'XOF',
        amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar'],
      },
    });
  }
  console.log('✅ Chambres créées');

  const customers = [
    { firstName: 'Jean-Baptiste', lastName: 'Kouassi', email: 'jb.kouassi@gmail.com', phone: '+225 07 58 00 00 01', nationality: 'CI', loyaltyTier: 'GOLD' },
    { firstName: 'Marie', lastName: 'Traoré', email: 'm.traore@yahoo.fr', phone: '+225 05 45 00 00 02', nationality: 'ML', loyaltyTier: 'SILVER' },
    { firstName: 'Amara', lastName: 'Diallo', email: 'a.diallo@hotmail.com', phone: '+224 62 00 00 03', nationality: 'GN', loyaltyTier: 'BRONZE' },
    { firstName: 'Fatoumata', lastName: 'Coulibaly', email: 'f.coulibaly@gmail.com', phone: '+225 01 62 00 00 04', nationality: 'CI', loyaltyTier: 'STANDARD' },
    { firstName: 'Emmanuel', lastName: 'Asante', email: 'e.asante@corp.gh', phone: '+233 24 00 00 05', nationality: 'GH', loyaltyTier: 'PLATINUM' },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        ...customer,
        loyaltyPoints: Math.floor(Math.random() * 5000),
      },
    });
  }
  console.log('✅ Clients créés');

  console.log('');
  console.log('🎉 Seed terminé avec succès!');
  console.log('');
  console.log('Comptes de connexion:');
  console.log('  Super Admin  : admin@ahouzi.ci      / Admin@2024');
  console.log('  Manager      : manager@ahouzi.ci    / Manager@2024');
  console.log('  Réception    : reception@ahouzi.ci  / Reception@2024');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
