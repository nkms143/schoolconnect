export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type NoticeCategory = 'CIRCULAR' | 'EXAM_SCHEDULE' | 'EVENT' | 'HOLIDAY_NOTICE';
export type NoticePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  grade?: string;
  section?: string;
  bio?: string;
  interests?: string;
  phone?: string;
  coverImage?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isBlocked?: boolean;
  profile?: Profile;
  clubs?: { id: string; name: string; slug: string; role: string }[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  createdAt: string;
  author: {
    id: string;
    email: string;
    role: Role;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      grade?: string;
      section?: string;
    };
  };
  club?: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  comments: Comment[];
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  bannerUrl?: string;
  iconUrl?: string;
  membersCount: number;
  postsCount: number;
  eventsCount: number;
  discussionsCount: number;
  isMember?: boolean;
  userRole?: string | null;
  leader?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  createdAt: string;
}

export interface ClubDiscussion {
  id: string;
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  createdAt: string;
  expiresAt?: string;
  isClosed: boolean;
  totalVotes: number;
  hasVoted: boolean;
  userVotedOptionId?: string | null;
  options: PollOption[];
  creator: {
    id: string;
    role: Role;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  targetGrade?: string;
  attachmentUrl?: string;
  createdAt: string;
  author: {
    id: string;
    role: Role;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      section?: string;
    };
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  sender?: {
    id: string;
    email: string;
    profile?: Profile;
  };
  receiver?: {
    id: string;
    email: string;
    profile?: Profile;
  };
}

export interface Friend {
  friendshipId: string;
  connectedAt: string;
  user: {
    id: string;
    email: string;
    role: Role;
    profile?: Profile;
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface Conversation {
  user: {
    id: string;
    email: string;
    role: Role;
    profile?: Profile;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalPosts: number;
  totalClubs: number;
  totalPolls: number;
  totalAnnouncements: number;
  pendingReports: number;
}
