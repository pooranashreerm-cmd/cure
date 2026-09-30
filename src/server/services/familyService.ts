import { db } from '../db';
import { AccessStatus, FamilyInvitationRequest } from '../types';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class FamilyService {
  public static getFamilyCircle(patientUserId: string) {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found' };

    let group = db.familyGroups.find((g) => g.primaryUserId === patientUserId);
    if (!group) {
      group = {
        id: `fg-${Date.now()}`,
        name: 'Family Health Circle',
        primaryUserId: patientUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.familyGroups.push(group);
    }

    const members = db.familyMembers.filter((m) => m.patientId === patient.id && m.status !== 'REVOKED');
    const pendingInvites = db.familyAccessRequests.filter(
      (r) => r.familyGroupId === group!.id && r.status === 'PENDING'
    );

    return {
      group,
      members,
      pendingInvites,
    };
  }

  public static async inviteFamilyMember(patientUserId: string, payload: FamilyInvitationRequest) {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found' };

    const inviterUser = db.users.find((u) => u.id === patientUserId);

    let group = db.familyGroups.find((g) => g.primaryUserId === patientUserId);
    if (!group) {
      group = {
        id: `fg-${Date.now()}`,
        name: `${inviterUser?.name || 'My'} Family Health Circle`,
        primaryUserId: patientUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.familyGroups.push(group);
    }

    const request = {
      id: `far-${Date.now()}`,
      familyGroupId: group.id,
      invitedByUserId: patientUserId,
      targetUserId: null,
      targetPhone: payload.phoneNumber,
      relation: payload.relation,
      requestedPermissions: payload.permissions || ['VIEW_BASIC_PROFILE', 'VIEW_PRESCRIPTIONS', 'VIEW_MEDICINES'],
      status: 'PENDING' as AccessStatus,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.familyAccessRequests.unshift(request);

    // Also directly provision member as accepted for seamless instant simulation
    const member = {
      id: `fm-${Date.now()}`,
      familyGroupId: group.id,
      patientId: patient.id,
      name: payload.name,
      relation: payload.relation,
      phoneNumber: payload.phoneNumber,
      permissions: request.requestedPermissions,
      status: 'ACCEPTED' as AccessStatus,
      grantedAt: new Date().toISOString(),
    };
    db.familyMembers.push(member);

    AuditService.log({
      userId: patientUserId,
      actorRole: 'PATIENT',
      action: 'FAMILY_ACCESS_INVITE_SENT',
      resource: 'FamilyMember',
      resourceId: member.id,
      metadata: { relation: payload.relation, phone: payload.phoneNumber },
    });

    return {
      success: true,
      message: `Invitation sent to ${payload.name} (${payload.phoneNumber}).`,
      member,
    };
  }

  public static async revokeMember(memberId: string, patientUserId: string) {
    const member = db.familyMembers.find((m) => m.id === memberId);
    if (!member) throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'Family member not found' };

    member.status = 'REVOKED';
    member.revokedAt = new Date().toISOString();

    AuditService.log({
      userId: patientUserId,
      actorRole: 'PATIENT',
      action: 'FAMILY_ACCESS_REVOKED',
      resource: 'FamilyMember',
      resourceId: member.id,
    });

    return { success: true, message: 'Family member access revoked.' };
  }
}
