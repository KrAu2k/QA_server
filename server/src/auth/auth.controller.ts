import { Controller, Post, Get, Body, Headers, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Request() req: any,
  ) {
    // 获取客户端信息
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];

    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
      ipAddress,
      userAgent,
    );
    return this.authService.login(user, ipAddress, userAgent);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: { refresh_token: string }) {
    return this.authService.refreshToken(refreshDto.refresh_token);
  }

  @Get('currentUser') //header  Authorization: Bearer token
  async currentUser(@Headers('Authorization') authHeader: string) {
    // 获取请求头中的 Authorization 字段
    const token = authHeader.split(' ')[1];
    return this.authService.currentUser(token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req: any) {
    // 获取客户端信息
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const user = req.user;

    return this.authService.logout(
      user.id,
      user.username || user.name,
      ipAddress,
      userAgent,
    );
  }

  //outLogin - 保持向后兼容
  @Post('outLogin')
  @UseGuards(AuthGuard('jwt'))
  async outLogin(@Request() req: any) {
    // 获取客户端信息
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const user = req.user;

    return this.authService.logout(
      user.id,
      user.username || user.name,
      ipAddress,
      userAgent,
    );
  }

  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}