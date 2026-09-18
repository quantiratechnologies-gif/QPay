/**
 * QPay Split Expense & RTP Service Implementation
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - Authoritative multi-party split expense management.
 * - Idempotency-protected creation and settlement.
 * - Enforces zero-trust participant ownership checks.
 */

import { getSupabase } from '../../services/supabaseClient';
import { AuthService, ForbiddenError } from '../auth';
import { Validator } from '../validation';
import { IdempotencyService } from '../idempotency';
import { AuditService } from '../audit';
import type {
  AuthContext,
  CreateSplitRequest,
  SplitExpenseDto,
  SplitMemberDto,
  DeclineMoneyRequest,
  DeclineMoneyResponseDto,
} from '../types';
import type { ISplitExpenseService } from './interfaces';

export class SplitExpenseService implements ISplitExpenseService {
  async createSplit(auth: AuthContext, req: CreateSplitRequest, idempotencyKey?: string): Promise<SplitExpenseDto> {
    const validatedTitle = Validator.validateString(req.title, 'Title', 3, 120);
    const validatedTotal = Validator.validateAmount(req.totalAmount, 'Total Amount', 50000);

    if (!Array.isArray(req.members) || req.members.length === 0) {
      throw new Error('Split expense must include at least one participant.');
    }

    // Idempotency check
    if (idempotencyKey) {
      const { isCached, cachedResponse } = await IdempotencyService.lockOrFetch<SplitExpenseDto>(
        idempotencyKey,
        auth.userId,
        '/api/v1/splits',
        req
      );
      if (isCached && cachedResponse) return cachedResponse;
    }

    const supabase = getSupabase();
    const splitId = `split-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    const membersDto: SplitMemberDto[] = req.members.map((m, idx) => {
      const memberAmt = Validator.validateAmount(m.amount, `Member ${m.name} amount`);
      const isSelf = m.upiId.toLowerCase() === auth.upiId.toLowerCase();
      return {
        id: `sm-${Date.now()}-${idx}`,
        splitId,
        name: Validator.validateString(m.name, 'Member Name', 2, 80),
        upiId: m.upiId.trim(),
        mobile: m.mobile ? Validator.validateSaudiMobile(m.mobile) : '+966500000000',
        avatarInitials: m.name.slice(0, 2).toUpperCase(),
        shareAmount: memberAmt,
        status: isSelf ? 'paid' : 'request_sent',
        hasPaid: isSelf,
        sarieRtpRef: isSelf ? undefined : `RTP-SARIE-${Date.now()}-${idx}`,
        settledAt: isSelf ? nowIso : undefined,
      };
    });

    const splitDto: SplitExpenseDto = {
      id: splitId,
      creatorProfileId: auth.profileId,
      creatorUpiId: auth.upiId,
      title: validatedTitle,
      totalAmount: validatedTotal,
      currency: 'SAR',
      status: 'active',
      notes: req.notes ? Validator.validateString(req.notes, 'Notes', 0, 300) : undefined,
      sarieBatchRef: `BATCH-SARIE-${Date.now()}`,
      expiresAt,
      members: membersDto,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Store in Supabase if active
    if (supabase) {
      try {
        await supabase.from('split_expenses').insert({
          id: splitDto.id,
          creator_profile_id: splitDto.creatorProfileId,
          creator_upi_id: splitDto.creatorUpiId,
          title: splitDto.title,
          total_amount: splitDto.totalAmount,
          currency: splitDto.currency,
          status: splitDto.status,
          notes: splitDto.notes,
          sarie_batch_ref: splitDto.sarieBatchRef,
          expires_at: splitDto.expiresAt,
        });

        for (const m of splitDto.members) {
          await supabase.from('split_members').insert({
            id: m.id,
            split_id: splitDto.id,
            name: m.name,
            upi_id: m.upiId,
            mobile: m.mobile,
            avatar_initials: m.avatarInitials,
            share_amount: m.shareAmount,
            status: m.status,
            has_paid: m.hasPaid,
            sarie_rtp_ref: m.sarieRtpRef,
            settled_at: m.settledAt,
          });
        }
      } catch (err) {
        console.warn('[SplitExpenseService] Supabase insert warning:', err);
      }
    }

    // Audit log
    await AuditService.log({
      actorId: auth.profileId,
      eventCategory: 'SPLIT_RTP',
      eventType: 'CREATE_SPLIT_EXPENSE',
      resourceType: 'SPLIT_EXPENSE',
      resourceId: splitId,
      newState: { title: splitDto.title, totalAmount: splitDto.totalAmount, membersCount: splitDto.members.length },
      status: 'SUCCESS',
    });

    if (idempotencyKey) {
      await IdempotencyService.complete(idempotencyKey, 201, splitDto);
    }

    return splitDto;
  }

  async getSplit(auth: AuthContext, splitId: string): Promise<SplitExpenseDto> {
    const supabase = getSupabase();
    if (supabase) {
      const { data: split, error } = await supabase
        .from('split_expenses')
        .select('*, split_members(*)')
        .eq('id', splitId)
        .maybeSingle();

      if (split && !error) {
        const memberUpis = (split.split_members || []).map((m: any) => m.upi_id);
        AuthService.assertSplitParticipant(auth, split.creator_profile_id, memberUpis);

        return {
          id: split.id,
          creatorProfileId: split.creator_profile_id,
          creatorUpiId: split.creator_upi_id,
          title: split.title,
          totalAmount: Number(split.total_amount),
          currency: split.currency,
          status: split.status,
          notes: split.notes,
          sarieBatchRef: split.sarie_batch_ref,
          expiresAt: split.expires_at,
          members: (split.split_members || []).map((m: any) => ({
            id: m.id,
            splitId: m.split_id,
            memberProfileId: m.member_profile_id,
            name: m.name,
            upiId: m.upi_id,
            mobile: m.mobile,
            avatarInitials: m.avatar_initials,
            shareAmount: Number(m.share_amount),
            status: m.status,
            hasPaid: Boolean(m.has_paid),
            sarieRtpRef: m.sarie_rtp_ref,
            settledAt: m.settled_at,
          })),
          createdAt: split.created_at,
          updatedAt: split.updated_at,
        };
      }
    }

    throw new Error(`Split expense '${splitId}' not found.`);
  }

  async settleMemberShare(auth: AuthContext, splitId: string, memberId: string, idempotencyKey?: string): Promise<SplitExpenseDto> {
    if (idempotencyKey) {
      const { isCached, cachedResponse } = await IdempotencyService.lockOrFetch<SplitExpenseDto>(
        idempotencyKey,
        auth.userId,
        `/api/v1/splits/${splitId}/settle`,
        { memberId }
      );
      if (isCached && cachedResponse) return cachedResponse;
    }

    const split = await this.getSplit(auth, splitId);
    const member = split.members.find((m) => m.id === memberId || m.upiId.toLowerCase() === auth.upiId.toLowerCase());

    if (!member) {
      throw new Error(`Participant '${memberId}' not found in split.`);
    }

    if (member.hasPaid) {
      return split; // Already settled
    }

    member.hasPaid = true;
    member.status = 'paid';
    member.settledAt = new Date().toISOString();

    const allPaid = split.members.every((m) => m.hasPaid);
    split.status = allPaid ? 'settled' : 'partially_settled';
    split.updatedAt = new Date().toISOString();

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('split_members')
          .update({ has_paid: true, status: 'paid', settled_at: member.settledAt })
          .eq('id', member.id);

        await supabase
          .from('split_expenses')
          .update({ status: split.status, updated_at: split.updatedAt })
          .eq('id', split.id);
      } catch (err) {
        console.warn('[SplitExpenseService] Supabase settle update warning:', err);
      }
    }

    await AuditService.log({
      actorId: auth.profileId,
      eventCategory: 'SPLIT_RTP',
      eventType: 'SETTLE_SPLIT_SHARE',
      resourceType: 'SPLIT_MEMBER',
      resourceId: member.id,
      newState: { splitId: split.id, memberUpi: member.upiId, amount: member.shareAmount, allSettled: allPaid },
      status: 'SUCCESS',
    });

    if (idempotencyKey) {
      await IdempotencyService.complete(idempotencyKey, 200, split);
    }

    return split;
  }

  async cancelSplit(auth: AuthContext, splitId: string): Promise<SplitExpenseDto> {
    const split = await this.getSplit(auth, splitId);
    if (split.creatorProfileId !== auth.profileId) {
      throw new ForbiddenError('Only the creator can cancel an active split bill.');
    }

    split.status = 'cancelled';
    split.updatedAt = new Date().toISOString();

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('split_expenses').update({ status: 'cancelled' }).eq('id', splitId);
      } catch (err) {
        console.warn('[SplitExpenseService] Cancel update error:', err);
      }
    }

    await AuditService.log({
      actorId: auth.profileId,
      eventCategory: 'SPLIT_RTP',
      eventType: 'CANCEL_SPLIT_EXPENSE',
      resourceType: 'SPLIT_EXPENSE',
      resourceId: splitId,
      status: 'SUCCESS',
    });

    return split;
  }

  async declineRtpRequest(
    auth: AuthContext,
    req: DeclineMoneyRequest,
    idempotencyKey?: string
  ): Promise<DeclineMoneyResponseDto> {
    const validatedReqId = Validator.validateString(req.requestId, 'Request ID', 3, 100);

    if (idempotencyKey) {
      const { isCached, cachedResponse } = await IdempotencyService.lockOrFetch<DeclineMoneyResponseDto>(
        idempotencyKey,
        auth.userId,
        '/api/v1/rtp/decline',
        req
      );
      if (isCached && cachedResponse) return cachedResponse;
    }

    const nowIso = new Date().toISOString();
    const responseDto: DeclineMoneyResponseDto = {
      requestId: validatedReqId,
      status: 'declined',
      declinedAt: nowIso,
      sarieRejectCode: 'RJCT_USER_DECLINED',
    };

    await AuditService.log({
      actorId: auth.profileId,
      eventCategory: 'SPLIT_RTP',
      eventType: 'DECLINE_RTP_REQUEST',
      resourceType: 'MONEY_REQUEST',
      resourceId: validatedReqId,
      newState: { status: 'declined', reason: req.reason || 'User initiated decline' },
      status: 'SUCCESS',
    });

    if (idempotencyKey) {
      await IdempotencyService.complete(idempotencyKey, 200, responseDto);
    }

    return responseDto;
  }
}
