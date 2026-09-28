import { User } from './user.entity';
import { UserSportsInterest } from './user-sports-interest.entity';
import { RoleApplication } from './role-application.entity';
import { Post } from './post.entity';
import { PostComment } from './post-comment.entity';
import { PostLike } from './post-like.entity';
import { PostReport } from './post-report.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvitation } from './team-invitation.entity';
import { TeamChallenge } from './team-challenge.entity';
import { Venue } from './venue.entity';
import { VenueFacility } from './venue-facility.entity';
import { VenueBooking } from './venue-booking.entity';
import { Tournament } from './tournament.entity';
import { TournamentRegistration } from './tournament-registration.entity';
import { TournamentBracket } from './tournament-bracket.entity';
import { Match } from './match.entity';
import { MatchScore } from './match-score.entity';
import { Payment } from './payment.entity';
import { Notification } from './notification.entity';

export * from './user.entity';
export * from './user-sports-interest.entity';
export * from './role-application.entity';
export * from './post.entity';
export * from './post-comment.entity';
export * from './post-like.entity';
export * from './post-report.entity';
export * from './team.entity';
export * from './team-member.entity';
export * from './team-invitation.entity';
export * from './team-challenge.entity';
export * from './venue.entity';
export * from './venue-facility.entity';
export * from './venue-booking.entity';
export * from './tournament.entity';
export * from './tournament-registration.entity';
export * from './tournament-bracket.entity';
export * from './match.entity';
export * from './match-score.entity';
export * from './payment.entity';
export * from './notification.entity';

export const ALL_ENTITIES = [
  User,
  UserSportsInterest,
  RoleApplication,
  Post,
  PostComment,
  PostLike,
  PostReport,
  Team,
  TeamMember,
  TeamInvitation,
  TeamChallenge,
  Venue,
  VenueFacility,
  VenueBooking,
  Tournament,
  TournamentRegistration,
  TournamentBracket,
  Match,
  MatchScore,
  Payment,
  Notification,
];
