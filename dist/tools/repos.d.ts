import { z } from 'zod';
export interface RepoDTO {
    owner: string;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    default_branch: string;
}
export declare const badCreateRepository: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
            };
        };
        required: string[];
    };
};
export declare const CreateRepositorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    private: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    private: boolean;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    private?: boolean | undefined;
}>;
export declare const createRepositoryTool: {
    name: string;
    description: string;
    schema: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        private: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        private: boolean;
        description?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        private?: boolean | undefined;
    }>;
};
//# sourceMappingURL=repos.d.ts.map