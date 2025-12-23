import { Comment, User, DashboardStats } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Morgan',
  email: 'alex@moderation.io',
  role: 'admin',
};

export const generateMockComments = (): Comment[] => {
  const userNames = ['StreamFan2024', 'GamerPro99', 'CoolViewer', 'NightOwl', 'TechEnthusiast', 'MusicLover', 'SportsFan', 'Traveler'];
  const commentTexts = [
    'This stream is amazing!',
    'Love the content, keep it up!',
    'Can you play some music?',
    'First time here, loving it!',
    'Great gameplay!',
    'Hello from Brazil!',
    'This is so entertaining',
    'You should be banned for this terrible content',
    'What a waste of time',
    'Inappropriate language here',
    'Spam spam spam',
    'Check out my channel instead',
    'This is offensive garbage',
    'Best streamer ever!',
    'Can we get more of this?',
  ];

  const blockedTexts = [
    '[Blocked] Inappropriate content',
    '[Blocked] Spam detected',
    '[Blocked] Offensive language',
    '[Blocked] Self-promotion',
    '[Blocked] Harassment',
  ];

  const admins = ['Alex Morgan', 'Jordan Lee', 'System Auto-Mod'];

  return Array.from({ length: 50 }, (_, i) => {
    const isBlocked = Math.random() > 0.7;
    const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7);
    
    return {
      id: `comment-${i + 1}`,
      text: isBlocked 
        ? blockedTexts[Math.floor(Math.random() * blockedTexts.length)]
        : commentTexts[Math.floor(Math.random() * commentTexts.length)],
      userName: userNames[Math.floor(Math.random() * userNames.length)],
      status: (isBlocked ? 'blocked' : 'normal') as 'blocked' | 'normal',
      timestamp,
      blockedBy: isBlocked ? admins[Math.floor(Math.random() * admins.length)] : undefined,
      blockedAt: isBlocked ? new Date(timestamp.getTime() + Math.random() * 3600000) : undefined,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getMockStats = (comments: Comment[]): DashboardStats => {
  const blocked = comments.filter(c => c.status === 'blocked');
  return {
    totalComments: comments.length,
    blockedComments: blocked.length,
    blockedPercentage: Math.round((blocked.length / comments.length) * 100),
    latestBlocked: blocked.slice(0, 5),
  };
};
