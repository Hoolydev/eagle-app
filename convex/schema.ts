import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Companies table for multi-tenant support
  companies: defineTable({
    name: v.string(),
    cnpj: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    settings: v.optional(v.object({
      slaHours: v.number(),
      autoDispatch: v.boolean(),
      requirePhotos: v.number(),
      requireVideos: v.number(),
    })),
    isActive: v.boolean(),
  }),

  // User memberships for multi-tenant access
  memberships: defineTable({
    userId: v.id("users"),
    companyId: v.id("companies"),
    role: v.union(
      v.literal("admin"), 
      v.literal("gestor"), 
      v.literal("atendente"), 
      v.literal("qualidade"), 
      v.literal("parceiro"), 
      v.literal("client")
    ),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_company", ["companyId"])
    .index("by_user_company", ["userId", "companyId"]),

  // Clients managed by admin
  clients: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    address: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // Service orders
  serviceOrders: defineTable({
    companyId: v.id("companies"),
    clientId: v.id("clients"),
    orderNumber: v.string(),
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
    googleMapsLink: v.optional(v.string()),
    priority: v.union(v.literal("baixa"), v.literal("media"), v.literal("alta"), v.literal("urgente")),
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
    slaDeadline: v.number(),
    assignedPartnerId: v.optional(v.id("users")),
    createdBy: v.id("users"),
    estimatedValue: v.optional(v.number()),
    finalValue: v.optional(v.number()),
    // SOS specific fields
    vehicleInfo: v.optional(v.object({
      brand: v.string(),
      model: v.string(),
      year: v.optional(v.string()),
      plate: v.optional(v.string()),
      color: v.optional(v.string()),
    })),
    emergencyContact: v.optional(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_service_type", ["serviceType"])
    .index("by_partner", ["assignedPartnerId"])
    .index("by_company_status", ["companyId", "status"]),

  // Billing records
  billing: defineTable({
    companyId: v.id("companies"),
    clientId: v.id("clients"),
    serviceOrderId: v.id("serviceOrders"),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("overdue"), v.literal("cancelled")),
    dueDate: v.number(),
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_client", ["clientId"])
    .index("by_service_order", ["serviceOrderId"])
    .index("by_status", ["status"]),

  // Partners/Inspectors
  partners: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    specialties: v.array(v.string()),
    isActive: v.boolean(),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"]),

  // Audit log for all actions
  auditLog: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    metadata: v.optional(v.object({
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"]),

  // User sessions to track active company
  userSessions: defineTable({
    userId: v.id("users"),
    activeCompanyId: v.id("companies"),
    lastActivity: v.number(),
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
