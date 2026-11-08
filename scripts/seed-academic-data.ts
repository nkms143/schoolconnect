import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding Academic Suite (Quizzes, Leaderboard, Assignments, Notes)...');

  // Find admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('❌ No Admin user found to author academic content.');
    return;
  }

  const now = new Date();
  const pastStartDate = new Date(now.getTime() - 10 * 86400000);
  const pastEndDate = new Date(now.getTime() - 86400000); // Ended yesterday
  const liveStartDate = new Date(now.getTime() - 2 * 86400000); // Started 2 days ago
  const liveEndDate = new Date(now.getTime() + 5 * 86400000); // Ends in 5 days

  // 1. Concluded Quiz with Full Leaderboard
  const existingConcluded = await prisma.quiz.findFirst({
    where: { title: 'Inter-School Coding & Tech Challenge 2026' }
  });

  if (!existingConcluded) {
    console.log('🏆 Creating Concluded Coding Challenge Quiz with Leaderboard...');
    const concludedQuiz = await prisma.quiz.create({
      data: {
        creatorId: admin.id,
        title: 'Inter-School Coding & Tech Challenge 2026',
        description: 'Test your programming logic, algorithm concepts, and digital technology trivia in this untimed school-wide championship!',
        subject: 'Coding',
        grade: 'Grade 9',
        totalPoints: 50,
        status: 'CLOSED',
        startDate: pastStartDate,
        endDate: pastEndDate,
        isResultsReleased: true,
        questions: {
          create: [
            {
              questionText: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
              options: ['Queue', 'Stack', 'Array', 'Linked List'],
              correctIndex: 1,
              points: 10,
              order: 0
            },
            {
              questionText: 'What does "HTML" stand for in web development?',
              options: [
                'HyperText Markup Language',
                'HighText Machine Language',
                'HyperTransfer Mode Logic',
                'Home Tool Management Link'
              ],
              correctIndex: 0,
              points: 10,
              order: 1
            },
            {
              questionText: 'Which language is primarily used for frontend web development alongside HTML and CSS?',
              options: ['Python', 'JavaScript', 'C++', 'Java'],
              correctIndex: 1,
              points: 10,
              order: 2
            },
            {
              questionText: 'What is the time complexity of searching in a balanced Binary Search Tree?',
              options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
              correctIndex: 2,
              points: 10,
              order: 3
            },
            {
              questionText: 'Which SQL statement is used to extract data from a database?',
              options: ['EXTRACT', 'GET', 'SELECT', 'FETCH'],
              correctIndex: 2,
              points: 10,
              order: 4
            }
          ]
        }
      }
    });

    // Add sample submission for Admin (to test leaderboard)
    await prisma.quizSubmission.upsert({
      where: {
        quizId_studentId: {
          quizId: concludedQuiz.id,
          studentId: admin.id
        }
      },
      update: {},
      create: {
        quizId: concludedQuiz.id,
        studentId: admin.id,
        score: 50,
        maxScore: 50,
        completedAt: new Date(now.getTime() - 2 * 86400000)
      }
    });
  }

  // 2. Active Live Quiz Competition
  const existingActive = await prisma.quiz.findFirst({
    where: { title: 'Annual Science & Environment Olympiad 2026' }
  });

  if (!existingActive) {
    console.log('🧪 Creating Live Active Science Quiz Competition...');
    await prisma.quiz.create({
      data: {
        creatorId: admin.id,
        title: 'Annual Science & Environment Olympiad 2026',
        description: 'Explore the mysteries of physics, biology, and environmental conservation in this untimed quiz. Take your time, think carefully, and submit your answers!',
        subject: 'Science',
        grade: 'Grade 9',
        totalPoints: 40,
        status: 'PUBLISHED',
        startDate: liveStartDate,
        endDate: liveEndDate,
        isResultsReleased: false,
        questions: {
          create: [
            {
              questionText: 'What is the power source of a plant cell where photosynthesis occurs?',
              options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus'],
              correctIndex: 1,
              points: 10,
              order: 0
            },
            {
              questionText: 'What gas do humans inhale for cellular respiration, and what do plants release during the day?',
              options: ['Carbon Dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
              correctIndex: 2,
              points: 10,
              order: 1
            },
            {
              questionText: 'Which law of motion states that for every action, there is an equal and opposite reaction?',
              options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
              correctIndex: 2,
              points: 10,
              order: 2
            },
            {
              questionText: 'What layer of Earth’s atmosphere absorbs most of the Sun’s harmful ultraviolet radiation?',
              options: ['Troposphere', 'Ozone Layer', 'Mesosphere', 'Ionosphere'],
              correctIndex: 1,
              points: 10,
              order: 3
            }
          ]
        }
      }
    });
  }

  // 3. Sample Assignments
  const existingAssignment = await prisma.assignment.findFirst({
    where: { title: 'Grade 9 Mathematics: Linear Equations Problem Set' }
  });

  if (!existingAssignment) {
    console.log('📝 Creating Sample Assignments...');
    await prisma.assignment.create({
      data: {
        creatorId: admin.id,
        title: 'Grade 9 Mathematics: Linear Equations Problem Set',
        description: 'Solve problems 1 through 15 from Chapter 4 on Graphing Linear Equations and Finding Slopes. Show step-by-step working.',
        subject: 'Mathematics',
        grade: 'Grade 9',
        dueDate: new Date(now.getTime() + 4 * 86400000), // Due in 4 days
        maxPoints: 100,
        attachmentUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80'
      }
    });

    await prisma.assignment.create({
      data: {
        creatorId: admin.id,
        title: 'Science Lab: Photosynthesis & Solar Energy Report',
        description: 'Submit your 2-page lab report detailing the rate of photosynthesis under varying light intensities using elodea sprigs.',
        subject: 'Science',
        grade: 'Grade 9',
        dueDate: new Date(now.getTime() + 7 * 86400000), // Due in 7 days
        maxPoints: 50,
        attachmentUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80'
      }
    });
  }

  // 4. Sample Study Notes
  const existingNote = await prisma.studyNote.findFirst({
    where: { title: 'Laws of Motion & Universal Gravitation Study Guide' }
  });

  if (!existingNote) {
    console.log('📖 Publishing Sample Study Notes...');
    await prisma.studyNote.create({
      data: {
        authorId: admin.id,
        title: 'Laws of Motion & Universal Gravitation Study Guide',
        description: 'Comprehensive revision notes covering Newton’s three laws, momentum formulas, friction factors, and free-fall problems with diagrams.',
        subject: 'Science',
        grade: 'Grade 9',
        chapter: 'Chapter 9: Force & Motion',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        helpfulCount: 14
      }
    });

    await prisma.studyNote.create({
      data: {
        authorId: admin.id,
        title: 'Python Programming Essentials & Data Structures Cheat Sheet',
        description: 'Quick reference sheet on variables, loops, lists, dictionaries, functions, and recursion for beginner coders and Olympiad participants.',
        subject: 'Coding',
        grade: 'Grade 9',
        chapter: 'Module 2: Python Core',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        helpfulCount: 22
      }
    });

    await prisma.studyNote.create({
      data: {
        authorId: admin.id,
        title: 'Periodic Table Trends & Chemical Bonding Quick Summary',
        description: 'Key electronegativity trends, ionic vs covalent bonding rules, atomic radii comparisons, and valency tables.',
        subject: 'Science',
        grade: 'Grade 9',
        chapter: 'Chapter 3: Atoms & Molecules',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        helpfulCount: 18
      }
    });
  }

  console.log('✅ Academic Suite sample data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding academic data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

