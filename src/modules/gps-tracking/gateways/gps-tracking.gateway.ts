import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { GpsTrackingService } from '../gps-tracking.service';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: 'gps-tracking',
  cors: {
    origin: '*',
  },
})
export class GpsTrackingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private gpsTrackingService: GpsTrackingService) {}

  @SubscribeMessage('join-group')
  @UseGuards(WsJwtGuard)
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const userId = client.data.user.id;
    try {
      await this.gpsTrackingService.getGroup(data.groupId, userId);
      client.join(`group-${data.groupId}`);
      client.emit('joined-group', { groupId: data.groupId });
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('leave-group')
  async handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    client.leave(`group-${data.groupId}`);
    client.emit('left-group', { groupId: data.groupId });
  }

  @SubscribeMessage('update-location')
  @UseGuards(WsJwtGuard)
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; location: UpdateLocationDto },
  ) {
    const userId = client.data.user.id;
    try {
      const location = await this.gpsTrackingService.updateLocation(
        userId,
        data.groupId,
        data.location,
      );
      
      // Broadcast to all group members
      client.to(`group-${data.groupId}`).emit('location-updated', {
        user_id: userId,
        location: data.location,
        timestamp: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('send-invite')
  @UseGuards(WsJwtGuard)
  async handleSendInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; targetUserId: string },
  ) {
    const userId = client.data.user.id;
    try {
      // Notify target user if online
      client.to(`user-${data.targetUserId}`).emit('invite-received', {
        from_user_id: userId,
        group_id: data.groupId,
      });
    } catch (error) {
      throw new WsException(error.message);
    }
  }
}
