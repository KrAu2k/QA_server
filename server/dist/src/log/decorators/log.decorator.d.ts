export interface LogOptions {
    app: string;
    model: string;
    action: string;
    content?: string;
    billIdField?: string;
}
export declare const LOG_KEY = "log";
export declare const Log: (options: LogOptions) => import("@nestjs/common").CustomDecorator<string>;
