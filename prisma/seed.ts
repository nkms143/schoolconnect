import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SchoolConnect Database Seeding...');

  // Check if database is already seeded (e.g. during server restarts in production)
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && process.env.FORCE_SEED !== 'true') {
    console.log(`ℹ️ Database already populated (${existingUsers} users found). Skipping seeding to preserve data.`);
    console.log('💡 Set FORCE_SEED=true if you want to wipe and re-seed all tables.');
    return;
  }

  // Clean existing records if any
  try {
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
    await prisma.club.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (e) {
    console.log('Note: Tables may already be empty.');
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Users & Profiles
  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@schoolconnect.edu',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Principal Arthur Edwards',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          grade: 'Administration',
          section: 'Main Office',
          bio: 'Principal at Greenfield High School. Committed to fostering academic excellence, digital safety, and vibrant student community life.',
          interests: 'Leadership, Education Technology, Student Welfare, School Policy',
          phone: '+1 (555) 019-2831'
        }
      }
    }
  });

  // Teacher User
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@schoolconnect.edu',
      password: hashedPassword,
      role: 'TEACHER',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Mrs. Sarah Johnson',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          grade: 'Faculty',
          section: 'Science Dept',
          bio: 'Senior Physics and Astronomy Educator. Science Olympiad mentor and passionate advocate for STEM in schools.',
          interests: 'Astrophysics, Robotics, Scientific Method, STEM Mentorship',
          phone: '+1 (555) 018-9922'
        }
      }
    }
  });

  // Student 1: Alex Rivera
  const studentAlex = await prisma.user.create({
    data: {
      email: 'alex@schoolconnect.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Alex Rivera',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
          grade: '10th',
          section: 'Section A',
          bio: 'Tech enthusiast, aspiring full-stack developer, and member of the school Coding Club. Always up for hackathons and game dev!',
          interests: 'JavaScript, Python, Web Development, Chess, Robotics, Indie Game Dev'
        }
      }
    }
  });

  // Student 2: Emma Watson
  const studentEmma = await prisma.user.create({
    data: {
      email: 'emma@schoolconnect.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Emma Watson',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          grade: '10th',
          section: 'Section A',
          bio: 'Eco Club coordinator and debate club enthusiast. Let us make our school campus 100% green and single-use plastic free!',
          interests: 'Environmental Science, Debate, Public Speaking, Organic Gardening, Reading'
        }
      }
    }
  });

  // Student 3: Liam Chen
  const studentLiam = await prisma.user.create({
    data: {
      email: 'liam@schoolconnect.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Liam Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          grade: '11th',
          section: 'Section B',
          bio: 'Varsity Football Captain and Sports Club president. Passionate about fitness, team sports, and school spirit!',
          interests: 'Football, Basketball, Athletic Training, Nutrition, Leadership'
        }
      }
    }
  });

  // Student 4: Sophia Patel
  const studentSophia = await prisma.user.create({
    data: {
      email: 'sophia@schoolconnect.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Sophia Patel',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          grade: '9th',
          section: 'Section C',
          bio: 'Creative mind exploring watercolor, digital illustration, and theater stage design. Designing posters for school events.',
          interests: 'Digital Art, Watercolor Painting, Graphic Design, Photography, Pottery'
        }
      }
    }
  });

  console.log('✅ Users and Profiles created');

  // 2. Create the 5 Core School Clubs
  const scienceClub = await prisma.club.create({
    data: {
      name: 'Science Club',
      slug: 'science-club',
      category: 'Academics & Research',
      description: 'Explore the mysteries of the universe, conduct exciting lab experiments, and prepare for national science fairs and Olympiads.',
      bannerUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
      iconUrl: '🔬',
      leaderId: teacherUser.id
    }
  });

  const ecoClub = await prisma.club.create({
    data: {
      name: 'Eco Club',
      slug: 'eco-club',
      category: 'Environment & Sustainability',
      description: 'Dedicated to green campus initiatives, recycling programs, tree planting campaigns, and raising environmental awareness.',
      bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      iconUrl: '🌱',
      leaderId: studentEmma.id
    }
  });

  const codingClub = await prisma.club.create({
    data: {
      name: 'Coding Club',
      slug: 'coding-club',
      category: 'Technology & Innovation',
      description: 'Learn modern software development, AI, robotics, participate in hackathons, and build real applications for the school.',
      bannerUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      iconUrl: '💻',
      leaderId: studentAlex.id
    }
  });

  const sportsClub = await prisma.club.create({
    data: {
      name: 'Sports Club',
      slug: 'sports-club',
      category: 'Athletics & Fitness',
      description: 'Promoting active lifestyles, inter-house tournaments, team building, athletics, and cheering on Greenfield Hawks!',
      bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      iconUrl: '⚽',
      leaderId: studentLiam.id
    }
  });

  const artsClub = await prisma.club.create({
    data: {
      name: 'Arts Club',
      slug: 'arts-club',
      category: 'Fine Arts & Creativity',
      description: 'Unleash your creative potential through painting, digital illustrations, sculpture, gallery exhibitions, and stage decor.',
      bannerUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      iconUrl: '🎨',
      leaderId: studentSophia.id
    }
  });

  console.log('✅ Clubs created');

  // Club Memberships
  await prisma.clubMember.createMany({
    data: [
      { clubId: codingClub.id, userId: studentAlex.id, role: 'LEADER' },
      { clubId: codingClub.id, userId: studentEmma.id, role: 'MEMBER' },
      { clubId: codingClub.id, userId: studentLiam.id, role: 'MEMBER' },
      { clubId: ecoClub.id, userId: studentEmma.id, role: 'LEADER' },
      { clubId: ecoClub.id, userId: studentAlex.id, role: 'MEMBER' },
      { clubId: ecoClub.id, userId: studentSophia.id, role: 'MEMBER' },
      { clubId: sportsClub.id, userId: studentLiam.id, role: 'LEADER' },
      { clubId: sportsClub.id, userId: studentAlex.id, role: 'MEMBER' },
      { clubId: artsClub.id, userId: studentSophia.id, role: 'LEADER' },
      { clubId: artsClub.id, userId: studentEmma.id, role: 'MEMBER' },
      { clubId: scienceClub.id, userId: teacherUser.id, role: 'LEADER' },
      { clubId: scienceClub.id, userId: studentAlex.id, role: 'MEMBER' },
      { clubId: scienceClub.id, userId: studentEmma.id, role: 'MEMBER' }
    ]
  });

  // Club Events
  await prisma.clubEvent.createMany({
    data: [
      {
        clubId: codingClub.id,
        title: 'Greenfield Annual Hackathon 2026',
        description: '24-hour collaborative sprint to build interactive school web apps and smart IoT projects. Prizes for top 3 teams!',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Computer Lab 3 & Innovation Hub'
      },
      {
        clubId: ecoClub.id,
        title: 'Campus Tree Planting & Biodiversity Drive',
        description: 'Join us to plant 50 native saplings along the western sports ground and set up the new community herb garden.',
        eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Western School Garden'
      },
      {
        clubId: sportsClub.id,
        title: 'Inter-House Football Championship Semifinals',
        description: 'Cheer for Red Phoenix vs Blue Titans! Refreshments provided by the student council.',
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Main Football Turf Ground'
      },
      {
        clubId: scienceClub.id,
        title: 'Stargazing Night with Telescope Observation',
        description: 'Observation of Jupiter moons and Saturn rings through the new school celestial telescope.',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Science Building Rooftop Observatory'
      }
    ]
  });

  // Club Discussions
  await prisma.clubDiscussion.create({
    data: {
      clubId: codingClub.id,
      authorId: studentAlex.id,
      title: 'Should we introduce Rust or Python for our next micro-robotics workshop?',
      content: 'Hey everyone! For the upcoming robotics competition, we need to choose between Python for rapid prototyping or Rust for safety. Share your thoughts below!'
    }
  });

  await prisma.clubDiscussion.create({
    data: {
      clubId: ecoClub.id,
      authorId: studentEmma.id,
      title: 'Zero Single-Use Plastic Canteen Initiative',
      content: 'We met with the school administration and they agreed to support our reusable cutlery incentive program starting next Monday!'
    }
  });

  // 3. Friendships & Friend Requests
  await prisma.friendship.create({
    data: {
      userAId: studentAlex.id,
      userBId: studentEmma.id
    }
  });

  await prisma.friendship.create({
    data: {
      userAId: studentAlex.id,
      userBId: studentLiam.id
    }
  });

  await prisma.friendRequest.create({
    data: {
      senderId: studentSophia.id,
      receiverId: studentAlex.id,
      status: 'PENDING'
    }
  });

  console.log('✅ Friendships and Requests created');

  // 4. Social Posts with Comments & Likes
  const post1 = await prisma.post.create({
    data: {
      authorId: studentAlex.id,
      content: 'Just finished developing the prototype for our automated solar tracker project in the Coding & Science club! The sensor array now adjusts angles every 15 minutes with 98% tracking accuracy. What do you think? 🚀☀️',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      hashtags: '#CodingClub,#ScienceFair,#SolarTech,#GreenfieldHigh',
      clubId: codingClub.id
    }
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: studentEmma.id,
      content: 'Our Eco Club recycling drive collected over 240kg of clean paper and cardboard this week! A huge shoutout to everyone in Grade 10 who volunteered after class. Let us keep this green momentum going! 🌍♻️🌿',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80',
      hashtags: '#EcoClub,#GreenCampus,#Sustainability,#ZeroWaste',
      clubId: ecoClub.id
    }
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: studentLiam.id,
      content: 'Match day excitement! The Greenfield Hawks took home the regional basketball cup trophy today 74 - 68! Proud of our team effort and gratitude to all students who came out to cheer us in the bleachers! 🏀🏆🦅',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
      hashtags: '#SportsClub,#GreenfieldHawks,#Champions,#SchoolSpirit',
      clubId: sportsClub.id
    }
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: studentSophia.id,
      content: 'Working on the central backdrop mural for the Annual Arts Gala. Combining acrylic textures with fluid gradient sweeps. Sneak peek of the canvas in progress! 🎨✨',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      hashtags: '#ArtsClub,#MuralArt,#Creativity,#Gala2026',
      clubId: artsClub.id
    }
  });

  // Comments
  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        authorId: studentEmma.id,
        content: 'Incredible work Alex! Could we integrate this with the Eco Club greenhouse watering system?'
      },
      {
        postId: post1.id,
        authorId: teacherUser.id,
        content: 'Outstanding engineering! Bring the prototype to Wednesday physics lab so the junior classes can observe the calibration.'
      },
      {
        postId: post2.id,
        authorId: studentLiam.id,
        content: 'Awesome job Emma! The sports department will donate our old plastic bottle crates for the sorting station.'
      },
      {
        postId: post3.id,
        authorId: studentAlex.id,
        content: 'That clutch three-pointer in the final 40 seconds was legendary, Liam!'
      }
    ]
  });

  // Likes
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: studentEmma.id },
      { postId: post1.id, userId: studentLiam.id },
      { postId: post1.id, userId: teacherUser.id },
      { postId: post2.id, userId: studentAlex.id },
      { postId: post2.id, userId: studentSophia.id },
      { postId: post3.id, userId: studentAlex.id },
      { postId: post3.id, userId: studentEmma.id },
      { postId: post4.id, userId: studentEmma.id },
      { postId: post4.id, userId: studentAlex.id }
    ]
  });

  console.log('✅ Social posts, comments, and likes created');

  // 5. School Notice Board Announcements
  await prisma.announcement.create({
    data: {
      authorId: adminUser.id,
      title: 'Official Circular: Mid-Term Examination Schedule and Guidelines',
      content: 'The Mid-Term Examinations for Grades 9 through 12 will commence on November 24th, 2026. Hall tickets and seating charts will be distributed via respective homerooms on Friday. Students are required to arrive 15 minutes prior to session commencement in standard school uniform.',
      category: 'EXAM_SCHEDULE',
      priority: 'URGENT',
      targetGrade: 'ALL'
    }
  });

  await prisma.announcement.create({
    data: {
      authorId: teacherUser.id,
      title: 'Greenfield Science & Innovation Exhibition 2026',
      content: 'Calling all budding researchers, tinkerers, and innovators! Project proposals for the 2026 Science Fair are due by November 18th. Submissions are open in three categories: Physical Sciences, Biological Innovations, and Applied Software/Robotics.',
      category: 'EVENT',
      priority: 'IMPORTANT',
      targetGrade: 'ALL'
    }
  });

  await prisma.announcement.create({
    data: {
      authorId: adminUser.id,
      title: 'Holiday Notice: Autumn Inter-Term Recess',
      content: 'The school campus and administrative offices will remain closed from November 12th to November 16th in observance of the Autumn Recess. Regular academic classes will resume on Monday, November 17th.',
      category: 'HOLIDAY_NOTICE',
      priority: 'NORMAL',
      targetGrade: 'ALL'
    }
  });

  await prisma.announcement.create({
    data: {
      authorId: adminUser.id,
      title: 'Administrative Circular: Student ID Badge System Upgrade',
      content: 'Beginning next semester, all campus library checkouts, club room access, and cafeteria meal balances will be streamlined using the new digital SchoolConnect student credentials.',
      category: 'CIRCULAR',
      priority: 'NORMAL',
      targetGrade: 'ALL'
    }
  });

  console.log('✅ Notice board announcements created');

  // 6. Interactive Polls & Voting
  const poll1 = await prisma.poll.create({
    data: {
      creatorId: studentAlex.id,
      question: 'Which theme should Greenfield High adopt for the Annual Cultural Festival 2026?',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      options: {
        create: [
          { text: 'Retro 80s Cyberpunk & Neon Future' },
          { text: 'Enchanted Botanical Gardens & Nature' },
          { text: 'Interstellar Odyssey: Beyond the Stars' },
          { text: 'Renaissance Carnival & World Heritage' }
        ]
      }
    },
    include: {
      options: true
    }
  });

  // Cast initial votes
  if (poll1.options.length >= 3) {
    await prisma.vote.create({
      data: {
        pollId: poll1.id,
        optionId: poll1.options[0].id,
        userId: studentAlex.id
      }
    });

    await prisma.vote.create({
      data: {
        pollId: poll1.id,
        optionId: poll1.options[1].id,
        userId: studentEmma.id
      }
    });

    await prisma.vote.create({
      data: {
        pollId: poll1.id,
        optionId: poll1.options[2].id,
        userId: studentLiam.id
      }
    });
  }

  const poll2 = await prisma.poll.create({
    data: {
      creatorId: teacherUser.id,
      question: 'What is your preferred format for the upcoming Inter-School Coding Sprint?',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      options: {
        create: [
          { text: 'Solo Algorithm Challenges (2 hours)' },
          { text: 'Team Web App Hackathon (Full Day)' },
          { text: 'Game Jam: 48-hour Weekend Sprint' }
        ]
      }
    },
    include: {
      options: true
    }
  });

  if (poll2.options.length >= 2) {
    await prisma.vote.create({
      data: {
        pollId: poll2.id,
        optionId: poll2.options[1].id,
        userId: studentAlex.id
      }
    });
    await prisma.vote.create({
      data: {
        pollId: poll2.id,
        optionId: poll2.options[1].id,
        userId: studentSophia.id
      }
    });
  }

  console.log('✅ Polls and initial votes created');

  // 7. Messages (1-to-1 chat history)
  await prisma.message.createMany({
    data: [
      {
        senderId: studentAlex.id,
        receiverId: studentEmma.id,
        content: 'Hey Emma! Are we still reviewing the eco presentation slides after 4th period?',
        createdAt: new Date(Date.now() - 3600 * 1000 * 3),
        isRead: true
      },
      {
        senderId: studentEmma.id,
        receiverId: studentAlex.id,
        content: 'Yes! Meet in the media room at 3:30 PM. I added the new charts for paper recycling.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2),
        isRead: true
      },
      {
        senderId: studentAlex.id,
        receiverId: studentEmma.id,
        content: 'Awesome, see you then!',
        createdAt: new Date(Date.now() - 3600 * 1000),
        isRead: true
      }
    ]
  });

  console.log('✅ Sample chat history created');
  console.log('🎉 SchoolConnect Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
