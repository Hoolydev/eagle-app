import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId, createAccount } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper to check admin access
async function checkAdminAccess(ctx: any, companyId: string) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user_company", (q: any) => 
      q.eq("userId", userId).eq("companyId", companyId)
    )
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();

  if (!membership || !["admin", "gestor"].includes(membership.role)) {
    throw new Error("Admin access required");
  }

  return { userId, role: membership.role };
}

// Query version of admin access check for actions
export const checkAdminAccessQuery = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await checkAdminAccess(ctx, args.companyId);
  },
});

// Query to get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Internal mutation to create client records
export const _createClientRecords = internalMutation({
  args: {
    companyId: v.id("companies"),
    adminId: v.id("users"),
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if client already exists for this company
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .first();
    
    if (existingClient) {
      throw new Error("Cliente já existe nesta empresa");
    }

    // Create client record
    const clientId = await ctx.db.insert("clients", {
      companyId: args.companyId,
      userId: args.userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      cpfCnpj: args.cpfCnpj,
      address: args.address,
      isActive: true,
      createdBy: args.adminId,
    });

    // Create or update membership for client
    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user_company", (q) => 
        q.eq("userId", args.userId).eq("companyId", args.companyId)
      )
      .first();

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        role: "client",
        isActive: true,
      });
    } else {
      await ctx.db.insert("memberships", {
        userId: args.userId,
        companyId: args.companyId,
        role: "client",
        isActive: true,
      });
    }

    // Log action
    await ctx.db.insert("auditLog", {
      companyId: args.companyId,
      userId: args.adminId,
      action: "CREATE_CLIENT",
      entityType: "clients",
      entityId: clientId,
      newValues: args,
    });

    return clientId;
  },
});





// Create client (user must sign up separately)
export const createClient = action({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; clientId?: string }> => {
    // Create user with authentication credentials
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
      },
      profile: {
        email: args.email,
        name: args.name,
      },
    });

    const userId = user;

    // Create client records using internal mutation
    const clientId: Id<"clients"> = await ctx.runMutation(internal.clients._createClientRecords, {
      companyId: args.companyId,
      adminId: userId, // Use the created user as reference
      userId: userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      cpfCnpj: args.cpfCnpj,
      address: args.address,
    });

    return {
      success: true,
      clientId,
      message: "Cliente criado com sucesso! O usuário já pode fazer login.",
    };
  },
});



// List clients for admin
export const listClients = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx, args.companyId);

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return clients;
  },
});

// Get client details
export const getClientDetails = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    await checkAdminAccess(ctx, client.companyId);

    // Get recent orders
    const recentOrders = await ctx.db
      .query("serviceOrders")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .take(10);

    // Get billing info
    const billing = await ctx.db
      .query("billing")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    return {
      ...client,
      recentOrders,
      billing,
    };
  },
});

// Update client
export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    address: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const { userId } = await checkAdminAccess(ctx, client.companyId);

    const updates = Object.fromEntries(
      Object.entries(args).filter(([key, value]) => key !== "clientId" && value !== undefined)
    );

    await ctx.db.patch(args.clientId, updates);

    // Also update user name if provided
    if (args.name) {
      await ctx.db.patch(client.userId, { name: args.name });
    }

    // Log action
    await ctx.db.insert("auditLog", {
      companyId: client.companyId,
      userId,
      action: "UPDATE_CLIENT",
      entityType: "clients",
      entityId: args.clientId,
      newValues: updates,
    });

    return args.clientId;
  },
});
