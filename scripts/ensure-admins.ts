import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const emails = ['nksm143@gmail.com', 'nkms143@gmail.com'];

  for (const email of emails) {
    console.log(`Setting up Admin: ${email}...`);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isBlocked: false,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      create: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isBlocked: false,
        profile: {
          create: {
            fullName: 'E.Amarnath',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            grade: 'Administration',
            section: 'Main Office',
            bio: 'Super Administrator & Principal. Overseeing digital campus life, student clubs, and platform safety.',
            interests: 'Leadership, Education Technology, Student Welfare, School Policy',
            phone: '+1 (555) 019-2831'
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log(`✅ Success for ${email}: ID=${user.id}, Role=${user.role}, Name=${user.profile?.fullName}`);
  }

  // Also verify existing clubs
  const clubCount = await prisma.club.count();
  console.log(`ℹ️ Existing clubs in DB: ${clubCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error in ensure-admins:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

