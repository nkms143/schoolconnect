import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SchoolConnect Production Database Initialization...');

  // Check if database is already seeded (skip if Super Admin exists to preserve production data)
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: 'nksm143@gmail.com' }
  });

  if (existingSuperAdmin && process.env.FORCE_SEED !== 'true') {
    console.log(`ℹ️ Super Admin (${existingSuperAdmin.email}) already exists. Skipping seed step to preserve production data.`);
    return;
  }

  // Clean test records if force seeding
  if (process.env.FORCE_SEED === 'true') {
    console.log('⚠️ FORCE_SEED=true: Purging existing records...');
    await prisma.report.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.vote.deleteMany({});
    await prisma.pollOption.deleteMany({});
    await prisma.poll.deleteMany({});
    await prisma.clubDiscussion.deleteMany({});
    await prisma.clubEvent.deleteMany({});
    await prisma.clubMember.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.friendship.deleteMany({});
    await prisma.friendRequest.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
  }

  // 1. Create or ensure Super Admin: E.Amarnath
  console.log('👑 Configuring Super Admin: E.Amarnath (nksm143@gmail.com)...');
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026!';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'nksm143@gmail.com' },
    update: {
      role: 'ADMIN',
      isVerified: true
    },
    create: {
      email: 'nksm143@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
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
    }
  });

  console.log(`✅ Super Admin ready: ${superAdmin.email}`);

  // 2. Setup Clean Official School Clubs
  console.log('🏛️ Provisioning official school clubs...');
  const officialClubs = [
    {
      name: 'Coding & Technology Club',
      slug: 'coding-club',
      description: 'Explore programming, web development, algorithms, and participate in hackathons.',
      category: 'Technology',
      bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      iconUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Science & Astronomy Club',
      slug: 'science-club',
      description: 'Hands-on scientific experiments, Olympiad prep, and space exploration discussions.',
      category: 'Academics',
      bannerUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
      iconUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Eco Campus & Green Club',
      slug: 'eco-club',
      description: 'Promoting school recycling, campus biodiversity, tree plantation drives, and environmental sustainability.',
      category: 'Environment',
      bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      iconUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Sports & Athletics Club',
      slug: 'sports-club',
      description: 'Track and field, football, basketball, tournaments, and fitness routines for athletes.',
      category: 'Sports',
      bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      iconUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=200&q=80'
    },
    {
      name: 'Arts, Design & Photography Club',
      slug: 'arts-club',
      description: 'Visual arts, sketch workshops, campus gallery exhibits, and creative photography projects.',
      category: 'Arts',
      bannerUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      iconUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80'
    }
  ];

  for (const clubData of officialClubs) {
    const club = await prisma.club.upsert({
      where: { slug: clubData.slug },
      update: {
        name: clubData.name,
        description: clubData.description,
        category: clubData.category,
        bannerUrl: clubData.bannerUrl,
        iconUrl: clubData.iconUrl,
        leaderId: superAdmin.id
      },
      create: {
        ...clubData,
        leaderId: superAdmin.id
      }
    });

    // Ensure Super Admin is member/leader
    await prisma.clubMember.upsert({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: superAdmin.id
        }
      },
      update: {
        role: 'LEADER'
      },
      create: {
        clubId: club.id,
        userId: superAdmin.id,
        role: 'LEADER'
      }
    });
  }

  // 3. Welcome notice
  const existingNotice = await prisma.announcement.findFirst({
    where: { authorId: superAdmin.id }
  });

  if (!existingNotice) {
    console.log('📢 Publishing official welcome notice...');
    await prisma.announcement.create({
      data: {
        authorId: superAdmin.id,
        title: 'Welcome to SchoolConnect – The Official Digital Student Network',
        content: 'Welcome students and teachers to SchoolConnect! Connect with classmates, join school clubs, vote on school events, and stay updated with official circulars in a safe educational space.',
        category: 'CIRCULAR',
        priority: 'IMPORTANT',
        targetGrade: 'ALL'
      }
    });
  }

  console.log('🎉 Production database initialization complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error in production seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
