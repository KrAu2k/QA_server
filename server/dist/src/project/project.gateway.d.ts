import { Server, Socket } from 'socket.io';
import { ProjectService } from './project.service';
export declare class ProjectGateway {
    private readonly projectService;
    server: Server;
    constructor(projectService: ProjectService);
    handleUpdateCommand(data: {
        projectId: string;
        userId?: string;
        username?: string;
    }, client: Socket): Promise<void>;
    handleUpdateCodeCommand(data: {
        projectId: string;
        userId?: string;
        username?: string;
    }, client: Socket): Promise<void>;
    handleJoinRoom(data: {
        projectId: string;
    }, client: Socket): void;
    handleLeaveRoom(data: {
        projectId: string;
    }, client: Socket): void;
}
