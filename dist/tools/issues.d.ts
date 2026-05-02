import { z } from 'zod';
export declare const UpdateIssueSchema: z.ZodEffects<z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    issue_number: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
    issue_number: number;
    state?: "open" | "closed" | undefined;
    labels?: string[] | undefined;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
}, {
    owner: string;
    repo: string;
    issue_number: number;
    state?: "open" | "closed" | undefined;
    labels?: string[] | undefined;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
}>, {
    owner: string;
    repo: string;
    issue_number: number;
    state?: "open" | "closed" | undefined;
    labels?: string[] | undefined;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
}, {
    owner: string;
    repo: string;
    issue_number: number;
    state?: "open" | "closed" | undefined;
    labels?: string[] | undefined;
    title?: string | undefined;
    body?: string | undefined;
    assignees?: string[] | undefined;
}>;
export declare const updateIssueTool: {
    name: string;
    description: string;
    schema: z.ZodEffects<z.ZodObject<{
        owner: z.ZodString;
        repo: z.ZodString;
        issue_number: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        owner: string;
        repo: string;
        issue_number: number;
        state?: "open" | "closed" | undefined;
        labels?: string[] | undefined;
        title?: string | undefined;
        body?: string | undefined;
        assignees?: string[] | undefined;
    }, {
        owner: string;
        repo: string;
        issue_number: number;
        state?: "open" | "closed" | undefined;
        labels?: string[] | undefined;
        title?: string | undefined;
        body?: string | undefined;
        assignees?: string[] | undefined;
    }>, {
        owner: string;
        repo: string;
        issue_number: number;
        state?: "open" | "closed" | undefined;
        labels?: string[] | undefined;
        title?: string | undefined;
        body?: string | undefined;
        assignees?: string[] | undefined;
    }, {
        owner: string;
        repo: string;
        issue_number: number;
        state?: "open" | "closed" | undefined;
        labels?: string[] | undefined;
        title?: string | undefined;
        body?: string | undefined;
        assignees?: string[] | undefined;
    }>;
};
//# sourceMappingURL=issues.d.ts.map