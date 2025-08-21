import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
export declare class UserStatusInterceptor implements NestInterceptor {
    private jwtService;
    private userService;
    constructor(jwtService: JwtService, userService: UserService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
