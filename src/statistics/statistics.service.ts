import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { Team } from '../database/entities/team.entity';
import { Venue } from '../database/entities/venue.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get high-level platform overview metrics (Admin Dashboard - FR-30, UC-17)
   */
  async getOverview(): Promise<any> {
    const [
      matchesCountResult,
      matchesByStatusResult,
      venuesCountResult,
      teamsCountResult,
      tournamentsCountResult,
      usersCountResult,
    ] = await Promise.all([
      this.dataSource.query('SELECT COUNT(*) as total FROM matches'),
      this.dataSource.query(
        'SELECT match_status as status, COUNT(*) as count FROM matches GROUP BY match_status',
      ),
      this.dataSource.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM venues',
      ),
      this.dataSource.query('SELECT COUNT(*) as total FROM teams WHERE status = "ACTIVE"'),
      this.dataSource.query('SELECT COUNT(*) as total FROM tournaments'),
      this.dataSource.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN is_team_manager = 1 THEN 1 ELSE 0 END) as managers, SUM(CASE WHEN is_tournament_organizer = 1 THEN 1 ELSE 0 END) as organizers FROM users',
      ),
    ]);

    const statusBreakdown = (matchesByStatusResult || []).reduce((acc: any, row: any) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {
      SCHEDULED: 0,
      LIVE: 0,
      COMPLETED: 0,
      ABANDONED: 0,
      POSTPONED: 0,
    });

    return {
      matches: {
        total: Number(matchesCountResult[0]?.total || 0),
        byStatus: statusBreakdown,
      },
      venues: {
        total: Number(venuesCountResult[0]?.total || 0),
        active: Number(venuesCountResult[0]?.active || 0),
      },
      teams: {
        activeTotal: Number(teamsCountResult[0]?.total || 0),
      },
      tournaments: {
        total: Number(tournamentsCountResult[0]?.total || 0),
      },
      users: {
        total: Number(usersCountResult[0]?.total || 0),
        managers: Number(usersCountResult[0]?.managers || 0),
        organizers: Number(usersCountResult[0]?.organizers || 0),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get match statistics & breakdown by sports
   */
  async getMatchStatistics(): Promise<any> {
    const [matchesBySport, recentCompletedMatches] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          COALESCE(t.sport_type, 'FRIENDLY') as sportType,
          COUNT(m.id) as totalMatches,
          SUM(CASE WHEN m.match_status = 'COMPLETED' THEN 1 ELSE 0 END) as completedMatches,
          SUM(CASE WHEN m.match_status = 'LIVE' THEN 1 ELSE 0 END) as liveMatches
        FROM matches m
        LEFT JOIN tournaments t ON m.tournament_id = t.id
        GROUP BY COALESCE(t.sport_type, 'FRIENDLY')
      `),
      this.dataSource.query(`
        SELECT 
          m.id,
          m.scheduled_start_time as scheduledStartTime,
          ht.team_name as homeTeam,
          at.team_name as awayTeam,
          wt.team_name as winnerTeam,
          s.home_team_score_display as homeScore,
          s.away_team_score_display as awayScore,
          v.venue_name as venueName
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        LEFT JOIN teams wt ON m.winner_team_id = wt.id
        LEFT JOIN match_scores s ON m.id = s.match_id
        LEFT JOIN venues v ON m.venue_id = v.id
        WHERE m.match_status = 'COMPLETED'
        ORDER BY m.scheduled_start_time DESC
        LIMIT 10
      `),
    ]);

    return {
      sportsBreakdown: matchesBySport.map((row: any) => ({
        sportType: row.sportType,
        totalMatches: Number(row.totalMatches),
        completedMatches: Number(row.completedMatches),
        liveMatches: Number(row.liveMatches),
      })),
      recentCompleted: recentCompletedMatches,
    };
  }

  /**
   * Get venue utilization and distribution statistics
   */
  async getVenueStatistics(): Promise<any> {
    const [topVenues, cityDistribution, facilityStats] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          v.id,
          v.venue_name as venueName,
          v.city,
          v.district,
          COUNT(m.id) as matchesHosted
        FROM venues v
        LEFT JOIN matches m ON v.id = m.venue_id
        WHERE v.is_active = 1
        GROUP BY v.id, v.venue_name, v.city, v.district
        ORDER BY matchesHosted DESC
        LIMIT 10
      `),
      this.dataSource.query(`
        SELECT 
          city,
          COUNT(*) as venueCount
        FROM venues
        WHERE is_active = 1
        GROUP BY city
        ORDER BY venueCount DESC
      `),
      this.dataSource.query(`
        SELECT 
          SUM(has_floodlights) as floodlitVenues,
          SUM(has_parking) as parkingVenues,
          SUM(has_changing_rooms) as changingRoomVenues,
          COUNT(*) as totalFacilities
        FROM venue_facilities
      `),
    ]);

    return {
      topVenues: topVenues.map((v: any) => ({
        ...v,
        matchesHosted: Number(v.matchesHosted),
      })),
      cityDistribution: cityDistribution.map((c: any) => ({
        city: c.city,
        venueCount: Number(c.venueCount),
      })),
      facilitiesOverview: {
        totalFacilities: Number(facilityStats[0]?.totalFacilities || 0),
        floodlit: Number(facilityStats[0]?.floodlitVenues || 0),
        parking: Number(facilityStats[0]?.parkingVenues || 0),
        changingRooms: Number(facilityStats[0]?.changingRoomVenues || 0),
      },
    };
  }

  /**
   * Get team performance metrics (matches, wins, losses, win rate)
   */
  async getTeamStatistics(teamId: string): Promise<any> {
    const team = await this.dataSource.query('SELECT id, team_name, sport_type FROM teams WHERE id = ?', [
      teamId,
    ]);

    if (!team || team.length === 0) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const [statsResult, recentMatches] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          COUNT(*) as totalMatches,
          SUM(CASE WHEN m.match_status = 'COMPLETED' THEN 1 ELSE 0 END) as completedMatches,
          SUM(CASE WHEN m.winner_team_id = ? THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN m.match_status = 'COMPLETED' AND m.winner_team_id IS NOT NULL AND m.winner_team_id != ? THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN m.match_status = 'COMPLETED' AND m.winner_team_id IS NULL THEN 1 ELSE 0 END) as draws
        FROM matches m
        WHERE m.home_team_id = ? OR m.away_team_id = ?
      `, [teamId, teamId, teamId, teamId]),
      this.dataSource.query(`
        SELECT 
          m.id,
          m.scheduled_start_time as matchDate,
          m.match_status as status,
          ht.team_name as homeTeam,
          at.team_name as awayTeam,
          wt.team_name as winnerTeam,
          s.home_team_score_display as homeScore,
          s.away_team_score_display as awayScore
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        LEFT JOIN teams wt ON m.winner_team_id = wt.id
        LEFT JOIN match_scores s ON m.id = s.match_id
        WHERE m.home_team_id = ? OR m.away_team_id = ?
        ORDER BY m.scheduled_start_time DESC
        LIMIT 5
      `, [teamId, teamId]),
    ]);

    const totalMatches = Number(statsResult[0]?.totalMatches || 0);
    const completedMatches = Number(statsResult[0]?.completedMatches || 0);
    const wins = Number(statsResult[0]?.wins || 0);
    const losses = Number(statsResult[0]?.losses || 0);
    const draws = Number(statsResult[0]?.draws || 0);
    const winRate = completedMatches > 0 ? Number(((wins / completedMatches) * 100).toFixed(1)) : 0;

    return {
      team: team[0],
      performance: {
        totalMatches,
        completedMatches,
        wins,
        losses,
        draws,
        winRatePercentage: winRate,
      },
      recentMatches,
    };
  }

  /**
   * Get player athletic profile statistics
   */
  async getPlayerStatistics(userId: string): Promise<any> {
    const user = await this.dataSource.query(
      'SELECT id, full_name, email, profile_image_url FROM users WHERE id = ?',
      [userId],
    );

    if (!user || user.length === 0) {
      throw new NotFoundException(`Player with ID ${userId} not found`);
    }

    const [teamsJoined, interests, matchesCountResult] = await Promise.all([
      this.dataSource.query(`
        SELECT t.id, t.team_name as teamName, t.sport_type as sportType, tm.member_role as role
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        WHERE tm.user_id = ?
      `, [userId]),
      this.dataSource.query(`
        SELECT sport_type as sportType, skill_level as skillLevel
        FROM user_sports_interests
        WHERE user_id = ?
      `, [userId]),
      this.dataSource.query(`
        SELECT COUNT(DISTINCT m.id) as totalGames
        FROM matches m
        JOIN team_members tm ON (m.home_team_id = tm.team_id OR m.away_team_id = tm.team_id)
        WHERE tm.user_id = ?
      `, [userId]),
    ]);

    return {
      player: user[0],
      sportsInterests: interests,
      teams: teamsJoined,
      totalGamesInvolved: Number(matchesCountResult[0]?.totalGames || 0),
    };
  }
}
