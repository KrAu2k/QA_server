
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头中获取 token
      ignoreExpiration: false, // 过期验证
      secretOrKey: process.env.JWT_SECRET, // 从环境变量中读取签名密钥
    });
  }

  async validate(payload: any) {
    console.log('JWT payload:', payload);
    
    // 首先尝试按主键 ID 查找用户（因为实际的 sub 是主键 ID）
    let user;
    try {
      user = await this.userService.findOne(payload.sub);
    } catch (error) {
      // 如果按主键 ID 查找失败，尝试按 employeeNo 查找（向后兼容）
      user = await this.userService.findByEmployeeNo(payload.sub);
    }
    
    if (!user) {
      console.log(`用户 id=${payload.sub} 不存在，将在日志中设置为 null`);
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        code: 'USER_DISABLED',
        message: '用户账号已被禁用，请联系管理员',
        timestamp: new Date().toISOString(),
      });
    }

    // 返回包含isAdmin字段的用户信息
    const result = { 
      id: user.id,
      userId: payload.sub, 
      username: payload.username, 
      isAdmin: user.isAdmin,
      user 
    };
    
    return result;
  }
}
