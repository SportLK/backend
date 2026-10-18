import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MatchesService } from './matches.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchesGateway.name);

  constructor(private readonly matchesService: MatchesService) {}

  afterInit(server: Server) {
    this.logger.log('⚡ Matches & Live Scoring WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Mobile Spectators / Players join a match room
   * Event: 'joinMatch' | Payload: { matchId: string }
   */
  @SubscribeMessage('joinMatch')
  async handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    const roomName = `match_${data.matchId}`;
    await client.join(roomName);
    this.logger.log(`Client ${client.id} joined room ${roomName}`);

    // Fetch and return current match details and score immediately to the joining client
    try {
      const match = await this.matchesService.findOne(data.matchId);
      client.emit('matchData', match);
    } catch (error) {
      client.emit('error', { message: error.message });
    }

    return { event: 'joined', matchId: data.matchId };
  }

  /**
   * Mobile Spectators leave match room
   * Event: 'leaveMatch' | Payload: { matchId: string }
   */
  @SubscribeMessage('leaveMatch')
  async handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    const roomName = `match_${data.matchId}`;
    await client.leave(roomName);
    this.logger.log(`Client ${client.id} left room ${roomName}`);
    return { event: 'left', matchId: data.matchId };
  }

  /**
   * Tournament Organizer updates live points / score in real-time
   * Event: 'updateScore' | Payload: { matchId: string, scoreDto: UpdateScoreDto }
   */
  @SubscribeMessage('updateScore')
  async handleUpdateScore(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; score: UpdateScoreDto },
  ) {
    try {
      // 1. Persist updated score in MySQL via MatchesService
      const updatedScore = await this.matchesService.updateScore(
        data.matchId,
        data.score,
      );

      // 2. Broadcast scoreUpdated to ALL connected clients subscribed to this match room
      const roomName = `match_${data.matchId}`;
      this.server.to(roomName).emit('scoreUpdated', {
        matchId: data.matchId,
        score: updatedScore,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Broadcasting score update for match ${data.matchId}`);

      return { status: 'SUCCESS', score: updatedScore };
    } catch (error) {
      this.logger.error(`Failed to update score for match ${data.matchId}: ${error.message}`);
      client.emit('error', { message: error.message });
      return { status: 'ERROR', message: error.message };
    }
  }

  /**
   * Tournament Organizer changes match status (e.g. LIVE -> COMPLETED)
   * Event: 'updateMatchStatus' | Payload: { matchId: string, updateDto: UpdateMatchStatusDto }
   */
  @SubscribeMessage('updateMatchStatus')
  async handleUpdateMatchStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; statusDto: UpdateMatchStatusDto },
  ) {
    try {
      const updatedMatch = await this.matchesService.updateStatus(
        data.matchId,
        data.statusDto,
      );

      const roomName = `match_${data.matchId}`;
      this.server.to(roomName).emit('matchStatusChanged', {
        matchId: data.matchId,
        match: updatedMatch,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Broadcasting status change for match ${data.matchId}: ${updatedMatch.matchStatus}`);

      return { status: 'SUCCESS', match: updatedMatch };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { status: 'ERROR', message: error.message };
    }
  }

  /**
   * Broadcast helper for HTTP Controller updates
   */
  broadcastScoreUpdate(matchId: string, scoreData: any) {
    if (this.server) {
      const roomName = `match_${matchId}`;
      this.server.to(roomName).emit('scoreUpdated', {
        matchId,
        score: scoreData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast helper for HTTP Controller status updates
   */
  broadcastStatusUpdate(matchId: string, matchData: any) {
    if (this.server) {
      const roomName = `match_${matchId}`;
      this.server.to(roomName).emit('matchStatusChanged', {
        matchId,
        match: matchData,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
