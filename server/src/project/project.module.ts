import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectGateway } from './project.gateway';
import { Project } from './entities/project.entity';
import { ProjectUpdateLog } from './entities/project-update-log.entity';
import { ProjectUpdateCodeLog } from './entities/project-update-code-log.entity';
import { ProjectPackageLog } from './entities/project-package-log.entity';
import { ProjectCacheLog } from './entities/project-cache-log.entity';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectUpdateLog,
      ProjectUpdateCodeLog,
      ProjectPackageLog,
      ProjectCacheLog,
    ]),
    LogModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ProjectGateway
  ],
  exports: [ProjectService, ProjectGateway],
})
export class ProjectModule {}
