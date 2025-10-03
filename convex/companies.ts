import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get companies for current user
export const getUserCompanies = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const companies = await Promise.all(
      memberships.map(async (membership) => {
        const company = await ctx.db.get(membership.companyId);
        return company ? {
          ...company,
          role: membership.role,
        } : null;
      })
    );

    return companies.filter(Boolean);
  },
});

// Set active company for user
export const setActiveCompany = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user has access to this company
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_company", (q) => 
        q.eq("userId", userId).eq("companyId", args.companyId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!membership) {
      throw new Error("Access denied");
    }

    // Update or create user session
    const existingSession = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        activeCompanyId: args.companyId,
        lastActivity: Date.now(),
      });
    } else {
      await ctx.db.insert("userSessions", {
        userId,
        activeCompanyId: args.companyId,
        lastActivity: Date.now(),
      });
    }

    return args.companyId;
  },
});

// Get user's active company
export const getActiveCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!session) {
      return null;
    }

    const company = await ctx.db.get(session.activeCompanyId);
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user_company", (q) => 
        q.eq("userId", userId).eq("companyId", session.activeCompanyId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return company && membership ? {
      ...company,
      role: membership.role,
    } : null;
  },
});

// Create new company (admin only)
export const createCompany = mutation({
  args: {
    name: v.string(),
    cnpj: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create company
    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      cnpj: args.cnpj,
      address: args.address,
      phone: args.phone,
      email: args.email,
      settings: {
        slaHours: 24,
        autoDispatch: true,
        requirePhotos: 3,
        requireVideos: 1,
      },
      isActive: true,
    });

    // Add creator as admin
    await ctx.db.insert("memberships", {
      userId,
      companyId,
      role: "admin",
      isActive: true,
    });

    // Set as active company
    await ctx.db.insert("userSessions", {
      userId,
      activeCompanyId: companyId,
      lastActivity: Date.now(),
    });

    // Log action
    await ctx.db.insert("auditLog", {
      companyId,
      userId,
      action: "CREATE_COMPANY",
      entityType: "companies",
      entityId: companyId,
      newValues: args,
    });

    return companyId;
  },
});
