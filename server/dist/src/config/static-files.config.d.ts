import { ServeStaticModuleOptions } from '@nestjs/serve-static';
export declare function getProjectStaticConfigs(): ServeStaticModuleOptions[];
export declare function getProjectStaticUrl(projectId: string, baseUrl?: string): string;
