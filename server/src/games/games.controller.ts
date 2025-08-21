import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('games')
export class GamesController {
  
  @Get(':projectId')
  async getGameProject(
    @Param('projectId') projectId: string,
    @Res() res: Response
  ) {
    const projectPath = join(__dirname, '..', '..', '..', 'project_d', projectId, 'build');
    const indexPath = join(projectPath, 'index.html');
    
    if (!existsSync(indexPath)) {
      throw new NotFoundException(`游戏项目 ${projectId} 不存在`);
    }
    
    return res.sendFile(indexPath);
  }
  
  @Get(':projectId/*')
  async getGameAssets(
    @Param('projectId') projectId: string,
    @Param('0') filePath: string,
    @Res() res: Response
  ) {
    const projectPath = join(__dirname, '..', '..', '..', 'project_d', projectId, 'build');
    const assetPath = join(projectPath, filePath);
    
    if (!existsSync(assetPath)) {
      throw new NotFoundException(`文件不存在: ${filePath}`);
    }
    
    return res.sendFile(assetPath);
  }
}
