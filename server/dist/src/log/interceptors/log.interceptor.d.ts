import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LogService } from '../log.service';
export declare class LogInterceptor implements NestInterceptor {
    private readonly logService;
    constructor(logService: LogService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getClientIp;
    private parseOperationInfo;
    private sanitizeRequestData;
    private sanitizeResponseData;
}
