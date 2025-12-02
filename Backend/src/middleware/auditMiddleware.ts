import { Request, Response, NextFunction } from "express";
import { AuditLog } from "../models/AuditLog";

export const auditMiddleware = (action: string, entityType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        // extract id from common response shapes
        const extractIdFromResponse = (data: any) => {
            if (!data) return undefined;
            if (typeof data === 'string' || typeof data === 'number') return data;
            if (data.id) return data.id;
            if (data._id) return data._id;
            if (data.user) {
                if (data.user.id) return data.user.id;
                if (data.user._id) return data.user._id;
            }

            const queue = [data];
            const seen = new Set<any>();
            while (queue.length) {
                const node = queue.shift();
                if (!node || typeof node !== 'object' || seen.has(node)) continue;
                seen.add(node);
                if (node.id) return node.id;
                if (node._id) return node._id;
                for (const k of Object.keys(node)) {
                    const v = node[k];
                    if (v && typeof v === 'object') queue.push(v);
                }
            }
            return undefined;
        };

        res.json = function(this: Response, data: any) {
            try {
                const actorId = (req as any).user?.id || (req as any).user?._id;
                let entityId: any;

                if (action === 'CREATE') {
                    entityId = extractIdFromResponse(data);
                } else {
                    // For updates/deletes, prefer explicit route param, then response body, then authenticated user
                    entityId = req.params?.id || extractIdFromResponse(data) || (req as any).user?.id || (req as any).user?._id;
                }

                // If no actorId but this is a CREATE of a User, use created user's id as the actor (self-register)
                const effectiveUserId = actorId || ((action === 'CREATE' && entityType === 'User') ? entityId : undefined);

                if (!entityId) {
                    console.info(`Audit middleware: could not determine entityId for action=${action}, entityType=${entityType}, path=${req.path}`);
                }

                if (entityId && effectiveUserId) {
                    AuditLog.create({
                        userId: effectiveUserId,
                        action,
                        entityType,
                        entityId,
                        details:{
                            method: req.method,
                            path: req.path,
                            body: action !== 'DELETE' ? req.body : undefined,
                            responsePreview: (typeof data === 'object' ? (Array.isArray(data) ? data.slice(0,3) : data) : data)
                        }
                    }).catch(err => console.error('Audit log failed:', err));
                } else if (entityId && !effectiveUserId) {
                    // We have an entity id but not an actor id — still log but mark actor as unknown
                    AuditLog.create({
                        userId: undefined as any,
                        action,
                        entityType,
                        entityId,
                        details: { method: req.method, path: req.path, body: req.body, note: 'actor missing' }
                    }).catch(err => console.error('Audit log failed (no actor):', err));
                } else {
                    // Nothing to write; log for debugging so developers can adjust
                    console.debug('Audit middleware skipped creating log — missing entityId or userId.', { action, entityType, path: req.path });
                }
            } catch (err) {
                console.error('Audit middleware unexpected error:', err);
            }

            return originalJson.call(this, data);
        };
        
        next();
    };
};
