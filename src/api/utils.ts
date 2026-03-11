import type { Response } from 'express';

type ParseResult<T> = { success: true; data: T } | { success: false; error: { issues: unknown[] } };

export function parseBody<T>(res: Response, result: ParseResult<T>): T | null {
    if (!result.success) {
        res.status(400).json({ error: result.error.issues });
        return null;
    }
    return result.data;
}
