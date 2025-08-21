import { Response } from 'express';
export declare class GamesController {
    getGameProject(projectId: string, res: Response): Promise<void>;
    getGameAssets(projectId: string, filePath: string, res: Response): Promise<void>;
}
