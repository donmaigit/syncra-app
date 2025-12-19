const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Hash the password
  const hashedPassword = await bcrypt.hash('AdminSuper&098', 12)

  // 2. Create/Update the Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@syncra.jp' },
    update: {
      role: 'superadmin',
      plan: 'agency',
      subscriptionStatus: 'active'
    },
    create: {
      email: 'admin@syncra.jp',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'superadmin',
      plan: 'agency',        
      subdomain: 'admin',    
      subscriptionStatus: 'active'
    }
  })

  console.log('✅ Super Admin Created:')
  console.log({ id: admin.id, email: admin.email, subdomain: admin.subdomain })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })