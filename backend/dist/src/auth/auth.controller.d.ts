import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        id: any;
        email: any;
        role: any;
        token: string;
    }>;
}
