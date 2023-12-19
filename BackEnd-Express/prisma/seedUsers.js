const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { hashPassword } = require("../utilities/passwords");

// Per eseguire il seed, seguire i seguenti steps:
// Includere in package.json l'oggetto <<< "prisma": {"seed": "node prisma/seedUsers.js"} >>>
// Dopodichè, eseguire, dal terminale, il comando <<< npx prisma db seed >>>

async function seedInitialUsers()
{
    const userParts = process.env.USER_FOR_SEEDING.split(" ");
    const userName = userParts[0];
    const userSurname = userParts[1];
    const userRole = process.env.ROLE_FOR_SEEDING;
    const userEmail = process.env.MAIL_FOR_SEEDING;
    const userPsw = await hashPassword(process.env.PSW_FOR_SEEDING, 10);
    const michele = await prisma.user.upsert(
        {
            "where"   :   { "email"     : userEmail },
            "update"  :   {},
            "create"  :   {
                            "name"      : userName,
                            "surname"   : userSurname,
                            "role"      : userRole,
                            "email"     : userEmail,
                            "password"  : userPsw
                          }
        });
    const GachoPsw = await hashPassword("gachagacho", 10);
    const Gacho = await prisma.user.upsert(
        {
            "where"   :   { "email"     : "ignaciodava@gmail.com" },
            "update"  :   {},
            "create"  :   {
                            "name"      : "Ignacio Joshua",
                            "surname"   : "Davalos Sosa",
                            "email"     : "ignaciodava@gmail.com",
                            "password"  : GachoPsw
                          }
        });
}

seedInitialUsers()
  .then( async () => 
  {
    await prisma.$disconnect();
  })
  .catch( async (e) => 
    {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })