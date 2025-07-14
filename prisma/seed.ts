import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@crm.local",
      name: "CRM Administrator",
      role: "ADMIN",
    },
  })

  console.log("✅ Created admin user:", adminUser.email)

  // Create sample contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        company: "Acme Corp",
        phone: "+1-555-0123",
        status: "PROSPECT",
        source: "Website",
        tags: ["potential", "enterprise"],
        userId: adminUser.id,
      },
    }),
    prisma.contact.create({
      data: {
        email: "jane.smith@techstart.com",
        firstName: "Jane",
        lastName: "Smith",
        company: "TechStart Inc",
        phone: "+1-555-0124",
        status: "CUSTOMER",
        source: "Referral",
        tags: ["customer", "startup"],
        userId: adminUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${contacts.length} sample contacts`)

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Follow up with John Doe",
        description: "Send product demo proposal",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: adminUser.id,
        contactId: contacts[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Prepare quarterly review",
        description: "Compile customer feedback and metrics",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        userId: adminUser.id,
      },
    }),
  ])

  console.log(`✅ Created ${tasks.length} sample tasks`)

  // Create activity entries
  await prisma.activity.create({
    data: {
      type: "CONTACT_CREATED",
      title: "Contact created",
      content: "John Doe was added as a new prospect",
      userId: adminUser.id,
      contactId: contacts[0].id,
    },
  })

  await prisma.activity.create({
    data: {
      type: "TASK_CREATED",
      title: "Task created",
      content: "Follow-up task assigned",
      userId: adminUser.id,
      contactId: contacts[0].id,
      taskId: tasks[0].id,
    },
  })

  console.log("✅ Created sample activities")

  console.log("🎉 Database seeded successfully\!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
