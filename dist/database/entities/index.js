"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ENTITIES = void 0;
const user_entity_1 = require("./user.entity");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
const role_application_entity_1 = require("./role-application.entity");
const post_entity_1 = require("./post.entity");
const post_comment_entity_1 = require("./post-comment.entity");
const post_like_entity_1 = require("./post-like.entity");
const post_report_entity_1 = require("./post-report.entity");
const team_entity_1 = require("./team.entity");
const team_member_entity_1 = require("./team-member.entity");
const team_invitation_entity_1 = require("./team-invitation.entity");
const team_challenge_entity_1 = require("./team-challenge.entity");
const venue_entity_1 = require("./venue.entity");
const venue_facility_entity_1 = require("./venue-facility.entity");
const venue_booking_entity_1 = require("./venue-booking.entity");
const tournament_entity_1 = require("./tournament.entity");
const tournament_registration_entity_1 = require("./tournament-registration.entity");
const tournament_bracket_entity_1 = require("./tournament-bracket.entity");
const match_entity_1 = require("./match.entity");
const match_score_entity_1 = require("./match-score.entity");
const payment_entity_1 = require("./payment.entity");
const notification_entity_1 = require("./notification.entity");
__exportStar(require("./user.entity"), exports);
__exportStar(require("./user-sports-interest.entity"), exports);
__exportStar(require("./role-application.entity"), exports);
__exportStar(require("./post.entity"), exports);
__exportStar(require("./post-comment.entity"), exports);
__exportStar(require("./post-like.entity"), exports);
__exportStar(require("./post-report.entity"), exports);
__exportStar(require("./team.entity"), exports);
__exportStar(require("./team-member.entity"), exports);
__exportStar(require("./team-invitation.entity"), exports);
__exportStar(require("./team-challenge.entity"), exports);
__exportStar(require("./venue.entity"), exports);
__exportStar(require("./venue-facility.entity"), exports);
__exportStar(require("./venue-booking.entity"), exports);
__exportStar(require("./tournament.entity"), exports);
__exportStar(require("./tournament-registration.entity"), exports);
__exportStar(require("./tournament-bracket.entity"), exports);
__exportStar(require("./match.entity"), exports);
__exportStar(require("./match-score.entity"), exports);
__exportStar(require("./payment.entity"), exports);
__exportStar(require("./notification.entity"), exports);
exports.ALL_ENTITIES = [
    user_entity_1.User,
    user_sports_interest_entity_1.UserSportsInterest,
    role_application_entity_1.RoleApplication,
    post_entity_1.Post,
    post_comment_entity_1.PostComment,
    post_like_entity_1.PostLike,
    post_report_entity_1.PostReport,
    team_entity_1.Team,
    team_member_entity_1.TeamMember,
    team_invitation_entity_1.TeamInvitation,
    team_challenge_entity_1.TeamChallenge,
    venue_entity_1.Venue,
    venue_facility_entity_1.VenueFacility,
    venue_booking_entity_1.VenueBooking,
    tournament_entity_1.Tournament,
    tournament_registration_entity_1.TournamentRegistration,
    tournament_bracket_entity_1.TournamentBracket,
    match_entity_1.Match,
    match_score_entity_1.MatchScore,
    payment_entity_1.Payment,
    notification_entity_1.Notification,
];
//# sourceMappingURL=index.js.map