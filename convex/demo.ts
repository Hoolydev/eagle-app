import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Setup demo data (for testing purposes)
export const setupDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create demo company
    const companyId = await ctx.db.insert("companies", {
      name: "Eagle Vistorias Demo",
      cnpj: "12.345.678/0001-90",
      address: "Rua das Vistorias, 123 - São Paulo, SP",
      phone: "(11) 99999-9999",
      email: "contato@eaglevistorias.com.br",
      settings: {
        slaHours: 24,
        autoDispatch: true,
        requirePhotos: 3,
        requireVideos: 1,
      },
      isActive: true,
    });

    // Add current user as admin
    await ctx.db.insert("memberships", {
      userId,
      companyId,
      role: "admin",
      isActive: true,
    });

    // Set as active company
    const existingSession = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        activeCompanyId: companyId,
        lastActivity: Date.now(),
      });
    } else {
      await ctx.db.insert("userSessions", {
        userId,
        activeCompanyId: companyId,
        lastActivity: Date.now(),
      });
    }

    // Create some sample clients first
    const sampleClients = [
      {
        name: "João Silva",
        phone: "(11) 98765-4321",
        email: "joao@email.com",
      },
      {
        name: "Maria Santos",
        phone: "(11) 87654-3210",
        email: "maria@email.com",
      },
      {
        name: "Pedro Oliveira",
        phone: "(11) 76543-2109",
        email: "pedro@email.com",
      },
    ];

    const clientIds = [];
    for (const clientData of sampleClients) {
      // Create user account for client
      const clientUserId = await ctx.db.insert("users", {
        name: clientData.name,
        email: clientData.email,
      });

      // Create client record
      const clientId = await ctx.db.insert("clients", {
        companyId,
        userId: clientUserId,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        isActive: true,
        createdBy: userId,
      });

      // Create membership for client
      await ctx.db.insert("memberships", {
        userId: clientUserId,
        companyId,
        role: "client",
        isActive: true,
      });

      clientIds.push(clientId);
    }

    // Create some sample service orders
    const sampleOrders = [
      {
        clientId: clientIds[0],
        address: "Rua das Flores, 456 - Vila Madalena, São Paulo, SP",
        description: "Vistoria residencial para seguro habitacional",
        priority: "media" as const,
      },
      {
        clientId: clientIds[1],
        address: "Av. Paulista, 1000 - Bela Vista, São Paulo, SP",
        description: "Vistoria comercial para renovação de apólice",
        priority: "alta" as const,
      },
      {
        clientId: clientIds[2],
        address: "Rua Augusta, 789 - Consolação, São Paulo, SP",
        description: "Vistoria de apartamento para compra",
        priority: "urgente" as const,
      },
    ];

    for (const orderData of sampleOrders) {
      const orderCount = await ctx.db
        .query("serviceOrders")
        .withIndex("by_company", (q) => q.eq("companyId", companyId))
        .collect();
      
      const orderNumber = `OS-${String(orderCount.length + 1).padStart(6, '0')}`;
      const slaDeadline = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      await ctx.db.insert("serviceOrders", {
        companyId,
        clientId: orderData.clientId,
        orderNumber,
        serviceType: "vistoria",
        address: orderData.address,
        description: orderData.description,
        priority: orderData.priority,
        status: "aberta",
        slaDeadline,
        createdBy: userId,
      });
    }

    return companyId;
  },
});

// Create admin user
export const createAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "admin@eagle.com"))
      .first();

    if (existingAdmin) {
      return existingAdmin._id;
    }

    // Create admin user
    const adminUserId = await ctx.db.insert("users", {
      name: "Administrador Eagle",
      email: "admin@eagle.com",
    });

    // Create admin company
    const companyId = await ctx.db.insert("companies", {
      name: "Eagle Vistorias - Matriz",
      cnpj: "00.000.000/0001-00",
      address: "Sede Principal - São Paulo, SP",
      phone: "(11) 0000-0000",
      email: "admin@eagle.com",
      settings: {
        slaHours: 24,
        autoDispatch: true,
        requirePhotos: 3,
        requireVideos: 1,
      },
      isActive: true,
    });

    // Add admin membership
    await ctx.db.insert("memberships", {
      userId: adminUserId,
      companyId,
      role: "admin",
      isActive: true,
    });

    // Create session for admin
    await ctx.db.insert("userSessions", {
      userId: adminUserId,
      activeCompanyId: companyId,
      lastActivity: Date.now(),
    });

    return adminUserId;
  },
});

// Clean up incorrectly created users and prepare for proper registration
export const cleanupIncorrectUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Find and remove incorrectly created users
    const adminUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "admin@eagle.com"))
      .first();
    
    const companyUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "silfrancys92@gmail.com"))
      .first();

    // Clean up admin user data
    if (adminUser) {
      // Remove sessions
      const adminSessions = await ctx.db
        .query("userSessions")
        .withIndex("by_user", (q) => q.eq("userId", adminUser._id))
        .collect();
      for (const session of adminSessions) {
        await ctx.db.delete(session._id);
      }

      // Remove memberships
      const adminMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", adminUser._id))
        .collect();
      for (const membership of adminMemberships) {
        await ctx.db.delete(membership._id);
      }

      // Remove user
      await ctx.db.delete(adminUser._id);
    }

    // Clean up company user data
    if (companyUser) {
      // Remove sessions
      const companySessions = await ctx.db
        .query("userSessions")
        .withIndex("by_user", (q) => q.eq("userId", companyUser._id))
        .collect();
      for (const session of companySessions) {
        await ctx.db.delete(session._id);
      }

      // Remove memberships
      const companyMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", companyUser._id))
        .collect();
      for (const membership of companyMemberships) {
        await ctx.db.delete(membership._id);
      }

      // Remove user
      await ctx.db.delete(companyUser._id);
    }

    return {
      message: "Usuários incorretos removidos. Agora os usuários podem se registrar através da interface.",
      instructions: "Use a aba 'Registrar' na tela de login para criar as contas com as credenciais desejadas."
    };
  },
});

// Setup default companies for new registrations
export const setupDefaultCompanies = mutation({
  args: {},
  handler: async (ctx) => {
    // Verificar se as empresas já existem
    const adminCompany = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("email"), "admin@eagle.com"))
      .first();
    
    const userCompany = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("email"), "silfrancys92@gmail.com"))
      .first();
    
    let adminCompanyId = adminCompany?._id;
    let userCompanyId = userCompany?._id;
    
    // Criar empresa admin se não existir
    if (!adminCompany) {
      adminCompanyId = await ctx.db.insert("companies", {
        name: "Eagle Admin Company",
        email: "admin@eagle.com",
        settings: {
          slaHours: 24,
          autoDispatch: true,
          requirePhotos: 3,
          requireVideos: 1,
        },
        isActive: true,
      });
    }
    
    // Criar empresa do usuário se não existir
    if (!userCompany) {
      userCompanyId = await ctx.db.insert("companies", {
        name: "Silfrancys Company",
        email: "silfrancys92@gmail.com",
        settings: {
          slaHours: 24,
          autoDispatch: true,
          requirePhotos: 3,
          requireVideos: 1,
        },
        isActive: true,
      });
    }
    
    return {
      message: "Empresas padrão configuradas com sucesso!",
      adminCompanyId,
      userCompanyId,
    };
  },
});

export const associateUserWithCompany = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Buscar usuário pelo email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    
    if (!user) {
      throw new Error(`Usuário com email ${email} não encontrado`);
    }
    
    // Verificar se já tem membership
    const existingMembership = await ctx.db
      .query("memberships")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    
    if (existingMembership) {
      return { message: "Usuário já associado a uma empresa" };
    }
    
    // Determinar empresa baseada no email
    let companyId;
    let role = "client";
    
    if (email === "admin@eagle.com") {
      const adminCompany = await ctx.db
        .query("companies")
        .filter((q) => q.eq(q.field("email"), "admin@eagle.com"))
        .first();
      companyId = adminCompany?._id;
      role = "admin";
    } else if (email === "silfrancys92@gmail.com") {
      const userCompany = await ctx.db
        .query("companies")
        .filter((q) => q.eq(q.field("email"), "silfrancys92@gmail.com"))
        .first();
      companyId = userCompany?._id;
      role = "client";
    }
    
    if (!companyId) {
      throw new Error(`Empresa não encontrada para o email ${email}`);
    }
    
    // Criar membership
    await ctx.db.insert("memberships", {
      userId: user._id,
      companyId,
      role: role as any,
      isActive: true,
    });
    
    // Criar sessão do usuário
    await ctx.db.insert("userSessions", {
      userId: user._id,
      activeCompanyId: companyId,
      lastActivity: Date.now(),
    });
    
    return {
      message: `Usuário ${email} associado com sucesso à empresa`,
      userId: user._id,
      companyId,
      role,
    };
  },
});

// Debug function to check system state
export const debugSystemState = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const companies = await ctx.db.query("companies").collect();
    const memberships = await ctx.db.query("memberships").collect();
    const sessions = await ctx.db.query("userSessions").collect();

    return {
      users: users.map(u => ({ id: u._id, name: u.name, email: u.email })),
      companies: companies.map(c => ({ id: c._id, name: c.name })),
      memberships: memberships.map(m => ({ 
        userId: m.userId, 
        companyId: m.companyId, 
        role: m.role, 
        active: m.isActive 
      })),
      sessions: sessions.map(s => ({ 
        userId: s.userId, 
        activeCompanyId: s.activeCompanyId 
      }))
    };
  },
});

export const debugUserRole = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    
    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    const session = await ctx.db
      .query("userSessions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!session) {
      return { error: "Sessão não encontrada" };
    }

    const membership = await ctx.db
      .query("memberships")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("companyId"), session.activeCompanyId),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    const company = await ctx.db.get(session.activeCompanyId);

    return {
      user: { id: user._id, name: user.name, email: user.email },
      company: company ? { id: company._id, name: company.name } : null,
      membership: membership ? { role: membership.role, active: membership.isActive } : null,
      session: { activeCompanyId: session.activeCompanyId }
    };
  },
});

export const fixUserRole = mutation({
  args: { email: v.string(), newRole: v.string() },
  handler: async (ctx, { email, newRole }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    
    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    const membership = await ctx.db
      .query("memberships")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (!membership) {
      return { error: "Membership não encontrada" };
    }

    await ctx.db.patch(membership._id, {
      role: newRole as any
    });

    return { message: `Role do usuário ${email} alterado para ${newRole}` };
  },
});
