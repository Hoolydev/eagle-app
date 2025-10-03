import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to check access
async function checkAccess(ctx: any, companyId: string, allowedRoles?: string[]) {
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

  if (!membership) {
    throw new Error("Access denied");
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }

  return { userId, role: membership.role };
}

// Get current user's client record
async function getCurrentClient(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const client = await ctx.db
    .query("clients")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();

  return client;
}

// Create service order (client)
export const createServiceOrder = mutation({
  args: {
    serviceType: v.union(
      v.literal("vistoria"),
      v.literal("laudo"),
      v.literal("sos_pneu"),
      v.literal("sos_combustivel"),
      v.literal("sos_bateria"),
      v.literal("sos_reboque")
    ),
    description: v.string(),
    address: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    priority: v.optional(v.union(v.literal("baixa"), v.literal("media"), v.literal("alta"), v.literal("urgente"))),
    vehicleInfo: v.optional(v.object({
      brand: v.string(),
      model: v.string(),
      year: v.optional(v.string()),
      plate: v.optional(v.string()),
      color: v.optional(v.string()),
    })),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const client = await getCurrentClient(ctx);
    if (!client) {
      throw new Error("Client not found");
    }

    // Generate order number
    const orderCount = await ctx.db
      .query("serviceOrders")
      .withIndex("by_company", (q) => q.eq("companyId", client.companyId))
      .collect();
    
    const orderNumber = `OS-${String(orderCount.length + 1).padStart(6, '0')}`;

    // Generate Google Maps link if coordinates provided
    let googleMapsLink;
    if (args.coordinates) {
      googleMapsLink = `https://www.google.com/maps?q=${args.coordinates.lat},${args.coordinates.lng}`;
    }

    // Set priority based on service type
    let priority = args.priority || "media";
    if (args.serviceType.startsWith("sos_")) {
      priority = "urgente";
    }

    // Calculate SLA deadline (SOS services get 2 hours, others get 24 hours)
    const slaHours = args.serviceType.startsWith("sos_") ? 2 : 24;
    const slaDeadline = Date.now() + (slaHours * 60 * 60 * 1000);

    const orderId = await ctx.db.insert("serviceOrders", {
      companyId: client.companyId,
      clientId: client._id,
      orderNumber,
      serviceType: args.serviceType,
      description: args.description,
      address: args.address,
      coordinates: args.coordinates,
      googleMapsLink,
      priority,
      status: "aberta",
      slaDeadline,
      createdBy: client.userId,
      vehicleInfo: args.vehicleInfo,
      emergencyContact: args.emergencyContact,
    });

    // Log action
    await ctx.db.insert("auditLog", {
      companyId: client.companyId,
      userId: client.userId,
      action: "CREATE_SERVICE_ORDER",
      entityType: "serviceOrders",
      entityId: orderId,
      newValues: args,
    });

    return orderId;
  },
});

// Get client's service orders
export const getClientOrders = query({
  args: {
    status: v.optional(v.union(
      v.literal("aberta"),
      v.literal("despachada"),
      v.literal("aceita"),
      v.literal("em_execucao"),
      v.literal("aguardando_validacao"),
      v.literal("aprovada"),
      v.literal("reprovada"),
      v.literal("finalizada"),
      v.literal("cancelada")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await getCurrentClient(ctx);
    if (!client) {
      return [];
    }

    let query = ctx.db
      .query("serviceOrders")
      .withIndex("by_client", (q) => q.eq("clientId", client._id));

    if (args.status) {
      query = ctx.db
        .query("serviceOrders")
        .withIndex("by_company_status", (q) => 
          q.eq("companyId", client.companyId).eq("status", args.status!)
        )
        .filter((q) => q.eq(q.field("clientId"), client._id));
    }

    const orders = await query
      .order("desc")
      .take(args.limit || 50);

    return orders.map(order => ({
      ...order,
      isOverdue: order.slaDeadline < Date.now(),
    }));
  },
});

// Admin: Get all orders by status for dashboard
export const getOrdersByStatus = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await checkAccess(ctx, args.companyId, ["admin", "gestor", "atendente", "qualidade", "parceiro"]);

    const orders = await ctx.db
      .query("serviceOrders")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const ordersByStatus: Record<string, any[]> = {
      aberta: [],
      despachada: [],
      aceita: [],
      em_execucao: [],
      aguardando_validacao: [],
      aprovada: [],
      reprovada: [],
      finalizada: [],
      cancelada: [],
    };

    for (const order of orders) {
      const client = await ctx.db.get(order.clientId);
      const partner = order.assignedPartnerId 
        ? await ctx.db.get(order.assignedPartnerId)
        : null;

      const enrichedOrder = {
        ...order,
        clientName: client?.name || "Unknown",
        clientPhone: client?.phone,
        clientEmail: client?.email,
        partner: partner?.name || null,
        isOverdue: order.slaDeadline < Date.now(),
      };

      ordersByStatus[order.status].push(enrichedOrder);
    }

    return ordersByStatus;
  },
});

// Update order status (admin)
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("serviceOrders"),
    status: v.union(
      v.literal("aberta"),
      v.literal("despachada"),
      v.literal("aceita"),
      v.literal("em_execucao"),
      v.literal("aguardando_validacao"),
      v.literal("aprovada"),
      v.literal("reprovada"),
      v.literal("finalizada"),
      v.literal("cancelada")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const { userId } = await checkAccess(ctx, order.companyId, ["admin", "gestor", "atendente", "qualidade", "parceiro"]);

    const oldStatus = order.status;
    await ctx.db.patch(args.orderId, {
      status: args.status,
    });

    // Log action
    await ctx.db.insert("auditLog", {
      companyId: order.companyId,
      userId,
      action: "UPDATE_ORDER_STATUS",
      entityType: "serviceOrders",
      entityId: args.orderId,
      oldValues: { status: oldStatus },
      newValues: { status: args.status, notes: args.notes },
    });

    return args.orderId;
  },
});

// Get order details
export const getOrderDetails = query({
  args: { orderId: v.id("serviceOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await checkAccess(ctx, order.companyId);

    const client = await ctx.db.get(order.clientId);
    const partner = order.assignedPartnerId 
      ? await ctx.db.get(order.assignedPartnerId)
      : null;

    return {
      ...order,
      clientName: client?.name || "Unknown",
      clientPhone: client?.phone,
      clientEmail: client?.email,
      partner: partner?.name || null,
      isOverdue: order.slaDeadline < Date.now(),
    };
  },
});

// Get dashboard stats for admin
export const getDashboardStats = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    await checkAccess(ctx, args.companyId, ["admin", "gestor", "atendente"]);

    const orders = await ctx.db
      .query("serviceOrders")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const billing = await ctx.db
      .query("billing")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const now = Date.now();
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    return {
      totalOrders: orders.length,
      totalClients: clients.length,
      ordersThisMonth: orders.filter(o => o._creationTime >= thisMonth).length,
      overdueOrders: orders.filter(o => o.slaDeadline < now && !["finalizada", "cancelada"].includes(o.status)).length,
      pendingBilling: billing.filter(b => b.status === "pending").reduce((sum, b) => sum + b.amount, 0),
      overdueBilling: billing.filter(b => b.status === "overdue").reduce((sum, b) => sum + b.amount, 0),
      sosOrders: orders.filter(o => o.serviceType.startsWith("sos_")).length,
      vistoriaOrders: orders.filter(o => o.serviceType === "vistoria").length,
      laudoOrders: orders.filter(o => o.serviceType === "laudo").length,
    };
  },
});
