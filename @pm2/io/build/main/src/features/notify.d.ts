import { Feature } from './featureTypes';
export declare class NotifyOptions {
    level: string;
    catchExceptions: boolean;
}
export declare const NotifyOptionsDefault: {
    level: string;
    catchExceptions: boolean;
};
export interface ErrorMetadata {
    type: String;
    subtype: String;
    className: String;
    description: String;
    objectId: String;
    uncaught: Boolean;
}
export declare class NotifyFeature implements Feature {
    private options;
    private levels;
    init(options?: NotifyOptions): Object;
    notifyError(err: Error, level?: string): number | null;
    catchAll(opts?: any): Boolean | void;
    expressErrorHandler(): (err: any, req: any, res: any, next: any) => any;
    private _interpretError;
}
