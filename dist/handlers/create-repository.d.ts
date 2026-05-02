export declare function createRepositoryHandler(args: unknown): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: never;
}>;
//# sourceMappingURL=create-repository.d.ts.map