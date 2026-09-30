import { db } from '../db';

export class AuditService {
  public static log(params: {
    userId?: string;
    actorRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    metadata?: any;
  }) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: params.userId || null,
      actorRole: params.actorRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      ipAddress: params.ipAddress || '127.0.0.1',
      metadata: params.metadata || {},
      timestamp: new Date().toISOString(),
    };

    db.auditLogs.push(entry);
    console.log(`[AUDIT LOG] [${entry.action}] by ${entry.actorRole} on ${entry.resource}:${entry.resourceId}`);
    return entry;
  }

  public static getLogs(filter?: { userId?: string; action?: string; resource?: string }) {
    return db.auditLogs.filter((log) => {
      if (filter?.userId && log.userId !== filter.userId) return false;
      if (filter?.action && log.action !== filter.action) return false;
      if (filter?.resource && log.resource !== filter.resource) return false;
      return true;
    });
  }
}
